'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { MANAGED_FILES } = require('./manifest');
const { success, warn, error, info, fileLine, blank } = require('./output');

/**
 * anws update — 将当前项目的托管文件更新到最新版本
 */
async function update() {
  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');

  // 检查 .agent/ 是否存在
  const agentExists = await fs.access(agentDir).then(() => true).catch(() => false);
  if (!agentExists) {
    error('No .agent/ found in current directory.');
    info('Run `anws init` first to set up the workflow system.');
    process.exit(1);
  }

  // 询问确认
  const confirmed = await askUpdate();
  if (!confirmed) {
    blank();
    info('Aborted. No files were changed.');
    process.exit(0);
  }

  // 仅覆盖托管文件
  const srcRoot = path.join(__dirname, '..', 'templates', '.agent');
  const updated = [];

  for (const rel of MANAGED_FILES) {
    const srcPath = path.join(path.dirname(srcRoot), rel); // templates/.agent/...
    const destPath = path.join(cwd, rel);

    const srcExists = await fs.access(srcPath).then(() => true).catch(() => false);
    if (!srcExists) continue;

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(srcPath, destPath);
    updated.push(rel);
  }

  // 打印摘要
  blank();
  info('Updated files:');
  blank();
  for (const rel of updated) {
    fileLine(rel.replace(/\\/g, '/'));
  }
  blank();
  success(`Done! ${updated.length} file(s) updated.`);
  info('Managed files have been updated to the latest version.');
  info('Your custom files in .agent/ were not touched.');
}

/**
 * 交互式确认更新操作（默认 N）。
 */
async function askUpdate() {
  if (!process.stdin.isTTY) {
    warn('Non-TTY environment detected. Skipping update to avoid accidental overwrites.');
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      '\n\u26a0 This will overwrite all managed .agent/ files. Continue? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

module.exports = update;
