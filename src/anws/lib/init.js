'use strict';

const path = require('node:path');
const { buildProjectionPlan } = require('./manifest');
const { getTarget, listTargets } = require('./adapters');
const { resolveAgentsInstall, printLegacyMigrationWarning, pathExists } = require('./agents');
const { ensureChangelogDir } = require('./changelog');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('./resources');
const { writeTargetFiles } = require('./copy');
const { createInstallLock, dedupeTargets, detectInstallState, summarizeTargetState, writeInstallLock } = require('./install-state');
const { selectMultiple, confirm } = require('./prompt');
const { success, warn, info, fileLine, skippedLine, blank, logo, section } = require('./output');

async function init() {
  const cwd = process.cwd();
  logo();
  const targets = await selectTargets();
  const targetIds = Array.from(new Set(targets.map((item) => item.id)));
  const targetPlans = buildProjectionPlan(targetIds);
  const installState = await detectInstallState(cwd);
  const srcAgents = ROOT_AGENTS_FILE;
  const cliVersion = require(path.join(__dirname, '..', 'package.json')).version;

  info('Initializing Anws...');
  info(`Target IDEs: ${targets.map((item) => item.label).join(', ')}`);
  if (installState.needsFallback) {
    info('Install lock missing or unreadable. Falling back to scanned target state.');
  }
  if (installState.drift.hasDrift) {
    warn(`Detected install-state drift. Missing on disk: ${installState.drift.missingOnDisk.join(', ') || 'none'}; untracked on disk: ${installState.drift.untrackedOnDisk.join(', ') || 'none'}.`);
  }
  blank();

  const written = [];
  const skipped = [];
  const successfulTargets = [];
  const failedTargets = [];

  for (const targetPlan of targetPlans) {
    const target = getTarget(targetPlan.targetId);
    const agentsDecision = target.id === 'antigravity'
      ? await resolveAgentsInstall({
        cwd,
        askMigrate,
        forceYes: !!global.__ANWS_FORCE_YES
      })
      : {
        shouldWriteRootAgents: false,
        shouldWarnMigration: false
      };

    const conflicting = await findConflicts(cwd, targetPlan.managedFiles);
    if (conflicting.length > 0) {
      const confirmed = await askOverwrite(conflicting.length, target.label);
      if (!confirmed) {
        skipped.push(...targetPlan.managedFiles);
        failedTargets.push({
          targetId: target.id,
          targetLabel: target.label,
          reason: `Skipped ${conflicting.length} conflicting managed file(s)`
        });
        continue;
      }
    }

    const result = await writeTargetFiles(cwd, {
      targetPlan,
      protectedFiles: targetPlan.userProtectedFiles,
      srcAgents,
      shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents,
      resolveCanonicalSource
    });

    written.push(...result.written);
    skipped.push(...result.skipped);
    successfulTargets.push(summarizeTargetState(targetPlan, cliVersion));

    if (agentsDecision.shouldWarnMigration) {
      printLegacyMigrationWarning();
    }
  }

  await ensureChangelogDir(cwd);
  const existingTargets = installState.lockResult.lock?.targets || [];
  const generatedAt = new Date().toISOString();
  await writeInstallLock(cwd, createInstallLock({
    cliVersion,
    generatedAt,
    targets: dedupeTargets([
      ...existingTargets,
      ...successfulTargets
    ]),
    lastUpdateSummary: {
      successfulTargets: successfulTargets.map((item) => item.targetId),
      failedTargets: failedTargets.map((item) => item.targetId),
      updatedAt: generatedAt
    }
  }));

  printTargetSummary(successfulTargets, failedTargets);

  for (const rel of written) {
    fileLine(rel.replace(/\\/g, '/'));
  }

  if (skipped.length > 0) {
    blank();
    info('Skipped (project-specific, preserved):');
    for (const rel of skipped) {
      skippedLine(rel.replace(/\\/g, '/'));
    }
  }

  blank();
  success(`Done! ${written.length} files written for ${successfulTargets.map((item) => item.targetLabel).join(', ') || 'selected targets'}.`);
  printNextSteps(targets);
}

// ─── 辅助函数 ──────────────────────────────────────────────────────────────────

/**
 * 找出 cwd 中已存在的托管文件列表。
 * @returns {Promise<string[]>} 已存在的托管文件相对路径数组
 */
async function findConflicts(cwd, managedFiles) {
  const conflicts = [];
  for (const rel of managedFiles) {
    const abs = path.join(cwd, rel);
    const exists = await pathExists(abs);
    if (exists) conflicts.push(rel);
  }
  return conflicts;
}

/**
 * 交互式询问用户是否覆盖（默认 N）。
 * 非 TTY 环境（如 CI）自动返回 false。
 * @returns {Promise<boolean>}
 */
async function askOverwrite(count, label) {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    warn(`${count} managed file(s) already exist. Non-TTY: skipping overwrite.`);
    return false;
  }

  return confirm({
    message: `Overwrite ${count} managed file(s) for ${label}?`,
    confirmLabel: 'Overwrite',
    cancelLabel: 'Skip',
    defaultValue: false
  });
}

async function askMigrate() {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    return false;
  }

  return confirm({
    message: 'Legacy .agent/ directory detected. Migrate to .agents/?',
    confirmLabel: 'Migrate',
    cancelLabel: 'Keep legacy',
    defaultValue: false
  });
}

/**
 * 打印操作摘要（更新场景）。
 * @param {string[]} files  已写入的文件
 * @param {string[]} skipped 受保护跳过的文件
 * @param {string}  action
 */
function printSummary(files, skipped = [], action) {
  const verb = action === 'updated' ? 'Updating' : 'Writing';
  blank();
  info(`${verb} files...`);
  blank();
  for (const rel of files) {
    fileLine(rel.replace(/\\/g, '/'));
  }
  if (skipped.length > 0) {
    blank();
    info('Skipped (project-specific, preserved):');
    for (const rel of skipped) {
      skippedLine(rel.replace(/\\/g, '/'));
    }
  }
  blank();
  success(`Done! ${files.length} file(s) ${action}${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}.`);
  if (action === 'updated') {
    info('Managed files have been updated to the latest version.');
  }
}

async function selectTargets() {
  if (global.__ANWS_TARGET_IDS && global.__ANWS_TARGET_IDS.length > 0) {
    return global.__ANWS_TARGET_IDS.map((targetId) => getTarget(targetId));
  }

  if (!process.stdin.isTTY) {
    return [getTarget('antigravity')];
  }

  const targets = listTargets();

  return selectMultiple({
    message: 'Choose your target AI IDEs:',
    options: targets.map((target) => ({ label: target.label, value: target.id })),
    initialSelectedIndexes: [1]
  }).then((selectedOptions) => selectedOptions.map((option) => getTarget(option.value)));
}

function printNextSteps(targets) {
  blank();
  section('Next steps', targets.some((target) => target.rootAgentFile)
    ? [
      '1. Read AGENTS.md to understand the system',
      '2. Run /quickstart in your AI assistant to analyze and start the workflow'
    ]
    : [
      '1. Review files written under the selected target directories',
      '2. Run /quickstart in your AI assistant to analyze and start the workflow'
    ]);
}

function printTargetSummary(successfulTargets, failedTargets) {
  blank();
  section('Target summary', [
    ...successfulTargets.map((target) => `✔ ${target.targetLabel} (${target.targetId})`),
    ...failedTargets.map((target) => `✖ ${target.targetLabel} (${target.targetId}) — ${target.reason}`)
  ]);
}

module.exports = init;

