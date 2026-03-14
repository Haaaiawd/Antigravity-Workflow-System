'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const {
  buildManagedFiles,
  buildProjectionEntries,
  buildUserProtectedFiles
} = require('./manifest');
const { detectInstalledTarget } = require('./adapters');
const { planAgentsUpdate, resolveAgentsInstall, printLegacyMigrationWarning, pathExists } = require('./agents');
const { collectManagedFileDiffs, printPreview } = require('./diff');
const { detectUpgrade, generateChangelog } = require('./changelog');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('./resources');
const { success, warn, error, info, fileLine, skippedLine, blank, logo } = require('./output');

async function update(options = {}) {
  const cwd = process.cwd();
  const check = !!options.check;
  const legacyAgentDir = path.join(cwd, '.agent');
  const { version } = require(path.join(__dirname, '..', 'package.json'));
  const installedTarget = await detectInstalledTarget(cwd);

  const legacyAgentExists = await pathExists(legacyAgentDir);
  const isLegacyMigration = !installedTarget && legacyAgentExists;

  if (!installedTarget && !legacyAgentExists) {
    logo();
    error('No supported Anws target layout found in current directory.');
    info('Run `anws init` first to set up the workflow system.');
    process.exit(1);
  }

  const target = installedTarget || { id: 'antigravity', label: 'Antigravity', rootAgentFile: true };
  const managedFiles = buildManagedFiles(target.id);
  const userProtectedFiles = buildUserProtectedFiles(target.id);
  const projectionEntries = buildProjectionEntries(target.id);
  const srcAgents = ROOT_AGENTS_FILE;
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
  if (isLegacyMigration) {
    logo();
    blank();
    info('Legacy .agent/ directory detected.');
    info('anws update will migrate managed files into the Antigravity target structure.');
    info('Your old .agent/ directory will be preserved for manual review.');
    blank();
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

  const versionState = await detectUpgrade({ cwd, version });
  const rawChanges = await collectManagedFileDiffs({
    cwd,
    managedFiles,
    projectionEntries,
    srcAgents,
    shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents,
    agentsUpdatePlan
  });
  const changes = rawChanges.filter((item) => {
    if (item.file !== 'AGENTS.md') return true;
    if (agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') return false;
    return agentsDecision.shouldWriteRootAgents;
  });

  if (check) {
    if (!versionState.needUpgrade) {
      if (!isLegacyMigration) {
        logo();
        blank();
      }
      info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
      return;
    }
    if (!isLegacyMigration) {
      logo();
      blank();
    }
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
    info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
    return;
  }

  const confirmed = await askUpdate(target);
  if (!confirmed) {
    blank();
    info('Aborted. No files were changed.');
    return;
  }

  if (!isLegacyMigration) {
    logo();
  }
  info(`Target IDE: ${target.label}`);
  const updated = [];
  const skipped = [];

  const projectionMap = new Map(projectionEntries.map((item) => [item.outputPath, item]));

  for (const rel of managedFiles) {
    if (rel === 'AGENTS.md' && !agentsDecision.shouldWriteRootAgents) {
      skipped.push(rel);
      continue;
    }

    if (rel === 'AGENTS.md' && agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') {
      skipped.push(rel);
      continue;
    }

    if (userProtectedFiles.includes(rel) && rel !== 'AGENTS.md') {
      if (!(rel === 'AGENTS.md' && agentsDecision.shouldWriteRootAgents)) {
        skipped.push(rel);
        continue;
      }
    }

    const entry = projectionMap.get(rel);
    const srcPath = rel === 'AGENTS.md' ? srcAgents : resolveCanonicalSource(entry.source);
    const destPath = path.join(cwd, rel);
    const srcExists = await pathExists(srcPath);
    if (!srcExists) continue;

    await fs.mkdir(path.dirname(destPath), { recursive: true });

    if (rel === 'AGENTS.md') {
      const templateContent = await fs.readFile(srcPath, 'utf8');
      const nextContent = agentsUpdatePlan ? agentsUpdatePlan.content : templateContent;
      await fs.writeFile(destPath, nextContent, 'utf8');
    } else {
      await fs.copyFile(srcPath, destPath);
    }

    updated.push(rel);
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

  const changelogPath = await generateChangelog({ cwd, version, changes });

  blank();
  success(`Done! ${updated.length} file(s) updated${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}.`);
  info('Managed files have been updated to the latest version.');
  info(`Your custom files outside the ${target.label} managed projection were not touched.`);
  if (isLegacyMigration) {
    info('Legacy .agent/ was preserved. You can review and delete it manually after migration.');
    const deleted = await maybeDeleteLegacyDir(legacyAgentDir);
    if (deleted) {
      info('Legacy .agent/ directory was deleted after confirmation.');
    }
  }
  info(`Generated upgrade record: ${path.relative(cwd, changelogPath).replace(/\\/g, '/')}`);
  info('Run `/upgrade` in your AI IDE to update your architecture docs.');
}

async function askUpdate(target) {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    warn('Non-TTY environment detected. Skipping update to avoid accidental overwrites.');
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      `\n⚠ This will overwrite all managed ${target.label} files. Continue? [y/N] `,
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

async function askMigrate() {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠ Legacy .agent/ directory detected. Do you want to migrate to .agents/? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
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

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const shouldDelete = await new Promise((resolve) => {
    rl.question(
      '\n⚠ Legacy .agent/ directory has been preserved. Delete it now? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });

  if (!shouldDelete) return false;

  await fs.rm(legacyAgentDir, { recursive: true, force: true });
  return true;
}

module.exports = update;
