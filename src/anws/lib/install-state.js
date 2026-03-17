'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { detectInstalledTargets } = require('./adapters');

const INSTALL_LOCK_RELATIVE_PATH = '.anws/install-lock.json';
const INSTALL_LOCK_VERSION = 1;

function getInstallLockPath(cwd) {
  return path.join(cwd, INSTALL_LOCK_RELATIVE_PATH);
}

function ensureString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid install-lock: ${fieldName} must be a non-empty string`);
  }
  return value;
}

function ensureObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid install-lock: ${fieldName} must be an object`);
  }
  return value;
}

function ensureArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid install-lock: ${fieldName} must be an array`);
  }
  return value;
}

function normalizeTargetInstallation(target) {
  const normalized = ensureObject(target, 'targets[]');
  const targetId = ensureString(normalized.targetId, 'targets[].targetId');
  const targetLabel = ensureString(normalized.targetLabel, 'targets[].targetLabel');
  const installedVersion = ensureString(normalized.installedVersion, 'targets[].installedVersion');
  const managedFiles = Array.from(new Set(ensureArray(normalized.managedFiles || [], 'targets[].managedFiles')));
  const ownership = Array.from(new Set(ensureArray(normalized.ownership || [], 'targets[].ownership')));

  return {
    targetId,
    targetLabel,
    installedVersion,
    managedFiles,
    ownership,
    lastSuccessfulUpdate: normalized.lastSuccessfulUpdate && typeof normalized.lastSuccessfulUpdate === 'object'
      ? {
          version: ensureString(normalized.lastSuccessfulUpdate.version, 'targets[].lastSuccessfulUpdate.version'),
          updatedAt: ensureString(normalized.lastSuccessfulUpdate.updatedAt, 'targets[].lastSuccessfulUpdate.updatedAt')
        }
      : null
  };
}

function dedupeTargets(targets) {
  const map = new Map();
  for (const target of targets.map(normalizeTargetInstallation)) {
    map.set(target.targetId, target);
  }
  return Array.from(map.values()).sort((a, b) => a.targetId.localeCompare(b.targetId));
}

function normalizeInstallLock(input) {
  const source = ensureObject(input, 'install-lock');
  const schemaVersion = source.schemaVersion ?? source.lockVersion ?? INSTALL_LOCK_VERSION;
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new Error('Invalid install-lock: schemaVersion must be a positive integer');
  }

  const cliVersion = ensureString(source.cliVersion, 'cliVersion');
  const generatedAt = ensureString(source.generatedAt, 'generatedAt');
  const targets = dedupeTargets(ensureArray(source.targets || [], 'targets'));
  const lastUpdateSummary = source.lastUpdateSummary == null
    ? null
    : {
        successfulTargets: Array.from(new Set(ensureArray(source.lastUpdateSummary.successfulTargets || [], 'lastUpdateSummary.successfulTargets'))),
        failedTargets: Array.from(new Set(ensureArray(source.lastUpdateSummary.failedTargets || [], 'lastUpdateSummary.failedTargets'))),
        updatedAt: ensureString(source.lastUpdateSummary.updatedAt, 'lastUpdateSummary.updatedAt')
      };

  return {
    schemaVersion,
    cliVersion,
    generatedAt,
    targets,
    lastUpdateSummary
  };
}

function createInstallLock({ cliVersion, generatedAt, targets = [], lastUpdateSummary = null }) {
  return normalizeInstallLock({
    schemaVersion: INSTALL_LOCK_VERSION,
    cliVersion,
    generatedAt,
    targets,
    lastUpdateSummary
  });
}

async function readInstallLock(cwd) {
  const lockPath = getInstallLockPath(cwd);
  let raw;
  try {
    raw = await fs.readFile(lockPath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { exists: false, lockPath, lock: null, error: null };
    }
    throw error;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      exists: true,
      lockPath,
      lock: normalizeInstallLock(parsed),
      error: null
    };
  } catch (error) {
    return {
      exists: true,
      lockPath,
      lock: null,
      error: new Error(`Failed to read install-lock: ${error.message}`)
    };
  }
}

async function writeInstallLock(cwd, lockInput) {
  const lockPath = getInstallLockPath(cwd);
  const normalized = normalizeInstallLock(lockInput);
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.writeFile(lockPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return { lockPath, lock: normalized };
}

function summarizeTargetState(targetPlan, installedVersion) {
  return normalizeTargetInstallation({
    targetId: targetPlan.targetId,
    targetLabel: targetPlan.targetLabel,
    installedVersion,
    managedFiles: targetPlan.managedFiles,
    ownership: targetPlan.ownership
  });
}

function detectLockDrift(lock, scannedTargets) {
  const lockTargetIds = new Set((lock?.targets || []).map((item) => item.targetId));
  const scannedTargetIds = new Set(scannedTargets.map((item) => item.id));

  const missingOnDisk = Array.from(lockTargetIds).filter((targetId) => !scannedTargetIds.has(targetId));
  const untrackedOnDisk = Array.from(scannedTargetIds).filter((targetId) => !lockTargetIds.has(targetId));

  return {
    hasDrift: missingOnDisk.length > 0 || untrackedOnDisk.length > 0,
    missingOnDisk,
    untrackedOnDisk
  };
}

async function detectInstallState(cwd) {
  const lockResult = await readInstallLock(cwd);
  const scannedTargets = await detectInstalledTargets(cwd);
  const lockTargets = lockResult.lock?.targets || [];
  const needsFallback = !lockResult.exists || !!lockResult.error;
  const fallbackReason = !needsFallback
    ? null
    : (!lockResult.exists ? 'missing_lock' : 'invalid_lock');
  const drift = detectLockDrift(lockResult.lock, scannedTargets);
  const shouldPreferScannedTargets = needsFallback || drift.hasDrift || lockTargets.length === 0;
  const selectedTargets = shouldPreferScannedTargets
    ? scannedTargets.map((item) => item.id)
    : lockTargets.map((item) => item.targetId);
  const stateSource = needsFallback
    ? 'directory_scan_fallback'
    : (drift.hasDrift ? 'directory_scan_drift' : 'install_lock');

  return {
    lockResult,
    scannedTargets,
    selectedTargets,
    drift,
    needsFallback,
    fallbackReason,
    stateSource,
    canRebuildLock: (needsFallback || drift.hasDrift) && selectedTargets.length > 0
  };
}

module.exports = {
  INSTALL_LOCK_RELATIVE_PATH,
  INSTALL_LOCK_VERSION,
  createInstallLock,
  detectInstallState,
  detectLockDrift,
  dedupeTargets,
  getInstallLockPath,
  normalizeInstallLock,
  normalizeTargetInstallation,
  readInstallLock,
  summarizeTargetState,
  writeInstallLock
};
