'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { buildManagedFiles, buildProjectionEntries, buildUserProtectedFiles } = require('./manifest');
const { getTarget, listTargets } = require('./adapters');
const { resolveAgentsInstall, printLegacyMigrationWarning, pathExists } = require('./agents');
const { ensureChangelogDir } = require('./changelog');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('./resources');
const { success, warn, info, fileLine, skippedLine, blank, logo } = require('./output');

/**
 * anws init — 将工作流系统写入当前项目
 */
async function init() {
  const cwd = process.cwd();
  const target = await selectTarget();
  const managedFiles = buildManagedFiles(target.id);
  const protectedFiles = buildUserProtectedFiles(target.id);
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
      shouldWarnMigration: false
    };

  const conflicting = await findConflicts(cwd, managedFiles);
  if (conflicting.length > 0) {
    const confirmed = await askOverwrite(conflicting.length);
    if (!confirmed) {
      blank();
      info('Aborted. No files were changed.');
      process.exit(0);
    }
    const { written: updated, skipped } = await overwriteManaged(cwd, {
      managedFiles,
      protectedFiles,
      projectionEntries,
      srcAgents,
      shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents
    });
    await ensureChangelogDir(cwd);
    if (agentsDecision.shouldWarnMigration) {
      printLegacyMigrationWarning();
    }
    printSummary(updated, skipped, 'updated');
    return;
  }
  // ── 无冲突:直接复制 ─────────────────────────────────────────────────────────

  logo();
  info('Initializing Anws...');
  info(`Target IDE: ${target.label}`);
  blank();

  const { written, skipped } = await overwriteManaged(cwd, {
    managedFiles,
    protectedFiles,
    projectionEntries,
    srcAgents,
    shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents
  });
  await ensureChangelogDir(cwd);

  if (agentsDecision.shouldWarnMigration) {
    printLegacyMigrationWarning();
  }

  // 打印文件列表
  for (const absPath of written) {
    const rel = path.relative(cwd, absPath).replace(/\\/g, '/');
    fileLine(rel);
  }

  if (skipped.length > 0) {
    blank();
    info('Skipped (project-specific, preserved):');
    for (const rel of skipped) {
      skippedLine(rel.replace(/\\/g, '/'));
    }
  }

  blank();
  success(`Done! ${written.length} files written for ${target.label}.`);
  printNextSteps(target);
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
async function askOverwrite(count) {
  if (global.__ANWS_FORCE_YES) return true;

  // 非 TTY 环境：默认不覆盖，防止 CI 挂起
  if (!process.stdin.isTTY) {
    warn(`${count} managed file(s) already exist. Non-TTY: skipping overwrite.`);
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      `\n\u26a0  ${count} managed file(s) already exist. Overwrite? [y/N] `,
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
      '\n\u26a0 Legacy .agent/ directory detected. Do you want to migrate to .agents/? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

/**
 * 仅覆盖托管清单内的文件，用户自有文件不受影响。
 * @returns {{ written: string[], skipped: string[] }}
 */
async function overwriteManaged(cwd, options = {}) {
  const written = [];
  const skipped = [];
  const managedFiles = options.managedFiles || [];
  const protectedFiles = options.protectedFiles || [];
  const projectionEntries = options.projectionEntries || [];
  const shouldWriteRootAgents = options.shouldWriteRootAgents !== false;
  const srcAgents = options.srcAgents || ROOT_AGENTS_FILE;
  const projectionMap = new Map(projectionEntries.map((item) => [item.outputPath, item]));

  for (const rel of managedFiles) {
    if (rel === 'AGENTS.md' && !shouldWriteRootAgents) {
      skipped.push(rel);
      continue;
    }

    if (protectedFiles.includes(rel)) {
      const destPath = path.join(cwd, rel);
      const exists = await pathExists(destPath);
      if (exists) {
        skipped.push(rel);
        continue;
      }
    }

    const entry = projectionMap.get(rel);
    const srcPath = rel === 'AGENTS.md' ? srcAgents : resolveCanonicalSource(entry.source);
    const destPath = path.join(cwd, rel);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const srcExists = await pathExists(srcPath);
    if (srcExists) {
      await fs.copyFile(srcPath, destPath);
      written.push(rel);
    }
  }

  return { written, skipped };
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

async function selectTarget() {
  if (global.__ANWS_TARGET_ID) {
    return getTarget(global.__ANWS_TARGET_ID);
  }

  if (!process.stdin.isTTY) {
    return getTarget('antigravity');
  }

  const targets = listTargets();
  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  blank();
  info('Choose your target AI IDE:');
  targets.forEach((target, index) => {
    info(`  ${index + 1}. ${target.label}`);
  });

  const selectedIndex = await new Promise((resolve) => {
    rl.question('\nSelect target [1-6] (default 2): ', (answer) => {
      rl.close();
      const normalized = answer.trim();
      if (!normalized) {
        resolve(1);
        return;
      }
      const parsed = Number.parseInt(normalized, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > targets.length) {
        resolve(1);
        return;
      }
      resolve(parsed - 1);
    });
  });

  return targets[selectedIndex];
}

function printNextSteps(target) {
  blank();
  info('Next steps:');
  if (target.rootAgentFile) {
    info('  1. Read AGENTS.md to understand the system');
  } else {
    info(`  1. Review files written under the ${target.label} target directories`);
  }
  info('  2. Run /quickstart in your AI assistant to analyze and start the workflow');
}

module.exports = init;
