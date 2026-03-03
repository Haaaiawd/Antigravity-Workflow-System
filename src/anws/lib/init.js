'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { copyDir } = require('./copy');
const { MANAGED_FILES, USER_PROTECTED_FILES } = require('./manifest');
const { success, warn, info, fileLine, skippedLine, blank, logo } = require('./output');

/**
 * anws init — 将工作流系统写入当前项目
 */
async function init() {
  const cwd = process.cwd();
  const srcRoot = path.join(__dirname, '..', 'templates', '.agent');
  const destRoot = path.join(cwd, '.agent');

  // ── 冲突检测（T1.2.3 在此处插入冲突分支）──────────────────────────────────
  const conflicting = await findConflicts(cwd);
  if (conflicting.length > 0) {
    const confirmed = await askOverwrite(conflicting.length);
    if (!confirmed) {
      blank();
      info('Aborted. No files were changed.');
      process.exit(0);
    }
    // 仅覆盖托管文件（用户自有文件不受影响）
    const { written: updated, skipped } = await overwriteManaged(srcRoot, cwd);
    await storeAgentsTemplateHash(srcRoot, cwd);
    printSummary(updated, skipped, 'updated');
    return;
  }
  // ── 无冲突:直接复制 ─────────────────────────────────────────────────────────

  logo();
  info('Initializing Antigravity Workflow System...');
  blank();

  const written = await copyDir(srcRoot, destRoot);

  // 存储 agents.md 模板指纹，供后续 update 检测模板变化
  await storeAgentsTemplateHash(srcRoot, cwd);

  // 打印文件列表
  for (const absPath of written) {
    const rel = path.relative(cwd, absPath).replace(/\\/g, '/');
    fileLine(rel);
  }

  blank();
  success(`Done! ${written.length} files written to .agent/`);
  printNextSteps();
}

// ─── 辅助函数 ──────────────────────────────────────────────────────────────────

/**
 * 找出 cwd 中已存在的托管文件列表。
 * @returns {Promise<string[]>} 已存在的托管文件相对路径数组
 */
async function findConflicts(cwd) {
  const conflicts = [];
  for (const rel of MANAGED_FILES) {
    const abs = path.join(cwd, rel);
    const exists = await fs.access(abs).then(() => true).catch(() => false);
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

/**
 * 仅覆盖 MANAGED_FILES 清单内的文件，用户自有文件不受影响。
 * USER_PROTECTED_FILES 中的文件即便冲突也跳过，保留用户修改。
 * @returns {{ written: string[], skipped: string[] }}
 */
async function overwriteManaged(srcRoot, cwd) {
  const srcBase = path.dirname(srcRoot); // templates/
  const written = [];
  const skipped = [];

  for (const rel of MANAGED_FILES) {
    // 受保护文件：文件已存在时跳过，交给用户自行维护
    if (USER_PROTECTED_FILES.includes(rel)) {
      const destPath = path.join(cwd, rel);
      const exists = await fs.access(destPath).then(() => true).catch(() => false);
      if (exists) {
        skipped.push(rel);
        continue;
      }
    }

    const srcPath = path.join(srcBase, rel);
    const destPath = path.join(cwd, rel);

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const srcExists = await fs.access(srcPath).then(() => true).catch(() => false);
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

function printNextSteps() {
  blank();
  info('Next steps:');
  info('  1. Read .agent/rules/agents.md to understand the system');
  info('  2. Run /quickstart in your AI assistant to analyze and start the workflow');
}

/**
 * 存储 agents.md 模板的 MD5 指纹。
 * 供 `anws update` 检测模板是否在版本间发生了变化。
 * @param {string} srcRoot  模板 .agent/ 目录绝对路径
 * @param {string} cwd      项目根目录
 */
async function storeAgentsTemplateHash(srcRoot, cwd) {
  const templatePath = path.join(srcRoot, 'rules', 'agents.md');
  const hashPath = path.join(cwd, '.agent', 'rules', '.agents-template-hash');

  try {
    const content = await fs.readFile(templatePath, 'utf-8');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    await fs.writeFile(hashPath, hash, 'utf-8');
  } catch {
    // 模板文件不存在时静默失败（不应该发生）
  }
}

module.exports = init;
