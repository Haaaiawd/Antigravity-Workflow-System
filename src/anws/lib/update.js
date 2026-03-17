'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { buildProjectionPlan } = require('./manifest');
const { getTarget } = require('./adapters');
const { planAgentsUpdate, resolveAgentsInstall, printLegacyMigrationWarning, pathExists } = require('./agents');
const { collectManagedFileDiffs, printPreview } = require('./diff');
const { detectUpgrade, generateChangelog } = require('./changelog');
const { writeTargetFiles } = require('./copy');
const { createInstallLock, dedupeTargets, detectInstallState, summarizeTargetState, writeInstallLock } = require('./install-state');
const { confirm } = require('./prompt');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('./resources');
const { success, warn, error, info, fileLine, skippedLine, blank, logo, section } = require('./output');

async function update(options = {}) {
  const cwd = process.cwd();
  const check = !!options.check;
  const legacyAgentDir = path.join(cwd, '.agent');
  const { version } = require(path.join(__dirname, '..', 'package.json'));
  const installState = await detectInstallState(cwd);
  const legacyAgentExists = await pathExists(legacyAgentDir);
  const isLegacyMigration = installState.selectedTargets.length === 0 && legacyAgentExists;
  const selectedTargetIds = isLegacyMigration ? ['antigravity'] : installState.selectedTargets;
  const targetPlans = buildProjectionPlan(selectedTargetIds);

  if (selectedTargetIds.length === 0 && !legacyAgentExists) {
    logo();
    error('No supported Anws target layout found in current directory.');
    info('Run `anws init` first to set up the workflow system.');
    process.exit(1);
  }

  const srcAgents = ROOT_AGENTS_FILE;

  if (isLegacyMigration) {
    logo();
    blank();
    printLegacyMigrationNotice();
    blank();
  }

  const versionState = await detectUpgrade({ cwd, version });
  const targetContexts = [];

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
        shouldWarnMigration: false,
        rootExists: false,
        legacyExists: false
      };

    if (!agentsDecision.shouldWriteRootAgents && agentsDecision.legacyExists) {
      info('Keeping legacy .agent/rules/agents.md. Will not pull root AGENTS.md.');
    }
    if (agentsDecision.shouldWarnMigration) {
      printLegacyMigrationWarning();
    }

    let agentsUpdatePlan = null;
    if (agentsDecision.shouldWriteRootAgents && agentsDecision.rootExists) {
      const templateContent = await fs.readFile(srcAgents, 'utf8');
      const existingContent = await fs.readFile(path.join(cwd, 'AGENTS.md'), 'utf8');
      agentsUpdatePlan = planAgentsUpdate({ templateContent, existingContent });

      if (agentsUpdatePlan.warning) {
        warn(agentsUpdatePlan.warning);
      }
    }

    const rawChanges = await collectManagedFileDiffs({
      cwd,
      projectionPlan: [targetPlan],
      srcAgents,
      shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents,
      agentsUpdatePlan
    });
    const changes = rawChanges.filter((item) => {
      if (item.file !== 'AGENTS.md') return true;
      if (agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') return false;
      return agentsDecision.shouldWriteRootAgents;
    });

    targetContexts.push({
      target,
      targetPlan,
      agentsDecision,
      agentsUpdatePlan,
      changes
    });
  }

  const changes = targetContexts.flatMap((context) => context.changes);

  if (check) {
    if (!versionState.needUpgrade) {
      if (!isLegacyMigration) {
        logo();
        blank();
      }
      info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
      printTargetSelection(installState, targetContexts.map((context) => context.target));
      return;
    }
    if (!isLegacyMigration) {
      logo();
      blank();
    }
    printTargetSelection(installState, targetContexts.map((context) => context.target));
    printPreview({
      fromVersion: versionState.fromVersion,
      toVersion: versionState.toVersion,
      changes
    });
    return;
  }

  if (!versionState.needUpgrade) {
    if (!isLegacyMigration) {
      logo();
      blank();
    }
    printTargetSelection(installState, targetContexts.map((context) => context.target));
    if (!check && installState.needsFallback && selectedTargetIds.length > 0) {
      const generatedAt = new Date().toISOString();
      await writeInstallLock(cwd, createInstallLock({
        cliVersion: version,
        generatedAt,
        targets: dedupeTargets(targetPlans.map((targetPlan) => summarizeTargetState(targetPlan, version))),
        lastUpdateSummary: {
          successfulTargets: [],
          failedTargets: [],
          updatedAt: generatedAt
        }
      }));
      info('Rebuilt .anws/install-lock.json from the detected target layout.');
    }
    info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
    return;
  }

  if (!isLegacyMigration) {
    logo();
    blank();
  }

  const confirmed = await askUpdate({
    installState,
    targets: targetContexts.map((context) => context.target)
  });
  if (!confirmed) {
    blank();
    info('Aborted. No files were changed.');
    return;
  }

  const updated = [];
  const skipped = [];
  const successfulTargets = [];
  const failedTargets = [];

  for (const context of targetContexts) {
    try {
      const result = await writeTargetFiles(cwd, {
        targetPlan: context.targetPlan,
        protectedFiles: context.targetPlan.userProtectedFiles,
        srcAgents,
        shouldWriteRootAgents: context.agentsDecision.shouldWriteRootAgents,
        agentsUpdatePlan: context.agentsUpdatePlan,
        resolveCanonicalSource
      });

      updated.push(...result.written);
      skipped.push(...result.skipped);
      successfulTargets.push(summarizeTargetState(context.targetPlan, version));
    } catch (error) {
      failedTargets.push({
        targetId: context.target.id,
        targetLabel: context.target.label,
        reason: error.message
      });
    }
  }

  blank();
  info('Updated files:');
  blank();
  for (const rel of updated) {
    fileLine(rel.replace(/\\/g, '/'));
  }

  if (skipped.length > 0) {
    blank();
    info('Skipped (project-specific, preserved):');
    for (const rel of skipped) {
      skippedLine(rel.replace(/\\/g, '/'));
    }
  }

  printTargetUpdateSummary(successfulTargets, failedTargets);

  const changelogPath = await generateChangelog({
    cwd,
    version,
    changes,
    targetSummary: {
      successfulTargets: successfulTargets.map((item) => `${item.targetLabel} (${item.targetId})`),
      failedTargets: failedTargets.map((item) => `${item.targetLabel} (${item.targetId})`)
    }
  });
  const generatedAt = new Date().toISOString();
  await writeInstallLock(cwd, createInstallLock({
    cliVersion: version,
    generatedAt,
    targets: dedupeTargets([
      ...(installState.lockResult.lock?.targets || []),
      ...successfulTargets
    ]),
    lastUpdateSummary: {
      successfulTargets: successfulTargets.map((item) => item.targetId),
      failedTargets: failedTargets.map((item) => item.targetId),
      updatedAt: generatedAt
    }
  }));

  let legacyCleanupLine = '';
  if (isLegacyMigration) {
    legacyCleanupLine = 'Legacy .agent/ was preserved. You can review and delete it manually after migration.';
    const deleted = await maybeDeleteLegacyDir(legacyAgentDir);
    if (deleted) {
      legacyCleanupLine = 'Legacy .agent/ directory was deleted after confirmation.';
    }
  }

  printUpdateCompletionSummary({
    updatedCount: updated.length,
    skippedCount: skipped.length,
    changelogPath: path.relative(cwd, changelogPath).replace(/\\/g, '/'),
    legacyCleanupLine
  });
}

async function askUpdate({ installState, targets }) {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    warn('Non-TTY environment detected. Skipping update to avoid accidental overwrites.');
    return false;
  }

  return confirm({
    message: buildUpdateConfirmationMessage(targets),
    contextLines: buildUpdateConfirmationContextLines(installState, targets),
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
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

async function maybeDeleteLegacyDir(legacyAgentDir) {
  const exists = await pathExists(legacyAgentDir);
  if (!exists) return false;

  if (global.__ANWS_FORCE_YES) {
    return false;
  }

  if (!process.stdin.isTTY) {
    return false;
  }

  const shouldDelete = await confirm({
    message: 'Legacy .agent/ directory has been preserved. Delete it now?',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
    defaultValue: false
  });

  if (!shouldDelete) return false;

  await fs.rm(legacyAgentDir, { recursive: true, force: true });
  return true;
}

function buildUpdateConfirmationMessage(targets) {
  const labels = targets.map((target) => target.label).filter(Boolean);
  if (labels.length === 0) {
    return 'This will overwrite all managed files for the detected target layout.';
  }
  return `This will overwrite all managed files for: ${labels.join(', ')}.`;
}

function buildUpdateConfirmationContextLines(installState, targets) {
  const lines = [
    `Matched targets: ${targets.map((target) => `${target.label} (${target.id})`).join(', ') || 'none'}`,
    installState.needsFallback ? 'State source: directory scan fallback' : 'State source: install-lock + directory scan'
  ];
  if (installState.drift.hasDrift) {
    lines.push(`State drift detected. Missing on disk: ${installState.drift.missingOnDisk.join(', ') || 'none'}; untracked on disk: ${installState.drift.untrackedOnDisk.join(', ') || 'none'}.`);
  }
  return lines;
}

function printLegacyMigrationNotice() {
  section('Legacy migration', [
    'Legacy .agent/ directory detected.',
    'anws update will migrate managed files into the Antigravity target structure.',
    'Your old .agent/ directory will be preserved for manual review.'
  ], { minWidth: 60 });
}

function printTargetSelection(installState, targets) {
  blank();
  section('Target selection', [
    `Matched targets: ${targets.map((target) => `${target.label} (${target.id})`).join(', ') || 'none'}`,
    installState.needsFallback ? 'State source: directory scan fallback' : 'State source: install-lock + directory scan',
    ...(installState.drift.hasDrift
      ? [`State drift detected. Missing on disk: ${installState.drift.missingOnDisk.join(', ') || 'none'}; untracked on disk: ${installState.drift.untrackedOnDisk.join(', ') || 'none'}.`]
      : [])
  ]);
}

function printTargetUpdateSummary(successfulTargets, failedTargets) {
  blank();
  section('Update summary by target', [
    ...successfulTargets.map((target) => `✔ ${target.targetLabel} (${target.targetId})`),
    ...failedTargets.map((target) => `✖ ${target.targetLabel} (${target.targetId}) — ${target.reason}`)
  ]);
}

function printUpdateCompletionSummary({ updatedCount, skippedCount, changelogPath, legacyCleanupLine }) {
  blank();
  section('Update completed', [
    `✔ Done! ${updatedCount} file(s) updated${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}.`,
    'Managed files have been updated to the latest version.',
    'Your custom files outside the selected target projections were not touched.',
    ...(legacyCleanupLine ? [legacyCleanupLine] : []),
    `Generated upgrade record: ${changelogPath}`,
    'Run `/upgrade` in your AI IDE to update your architecture docs.'
  ], { minWidth: 60 });
}

module.exports = update;




