'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * 递归复制目录，返回已写入的文件路径数组（相对于 destDir）。
 *
 * @param {string} srcDir  源目录绝对路径
 * @param {string} destDir 目标目录绝对路径（不存在时自动创建）
 * @returns {Promise<string[]>} 已写入文件的绝对路径列表
 */
async function copyDir(srcDir, destDir) {
  const written = [];

  async function walk(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await walk(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
        written.push(destPath);
      }
      // 忽略 symlink 等特殊文件类型
    }
  }

  await walk(srcDir, destDir);
  return written;
}

async function pathExists(targetPath) {
  return fs.access(targetPath).then(() => true).catch(() => false);
}

async function writeTargetFiles(cwd, options = {}) {
  const targetPlan = options.targetPlan || {};
  const protectedFiles = options.protectedFiles || targetPlan.userProtectedFiles || [];
  const projectionEntries = targetPlan.projectionEntries || [];
  const shouldWriteRootAgents = options.shouldWriteRootAgents !== false;
  const srcAgents = options.srcAgents;
  const agentsUpdatePlan = options.agentsUpdatePlan;
  const resolveCanonicalSource = options.resolveCanonicalSource;
  const projectionMap = new Map(projectionEntries.map((item) => [item.outputPath, item]));
  const written = [];
  const skipped = [];

  for (const rel of targetPlan.managedFiles || []) {
    if (rel === 'AGENTS.md' && !shouldWriteRootAgents) {
      skipped.push(rel);
      continue;
    }

    if (rel === 'AGENTS.md') {
      const destPath = path.join(cwd, rel);
      await fs.mkdir(path.dirname(destPath), { recursive: true });

      if (agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') {
        skipped.push(rel);
        continue;
      }

      if (agentsUpdatePlan && agentsUpdatePlan.content) {
        await fs.writeFile(destPath, agentsUpdatePlan.content, 'utf8');
        written.push(rel);
        continue;
      }

      if (await pathExists(srcAgents)) {
        await fs.copyFile(srcAgents, destPath);
        written.push(rel);
        continue;
      }
    }

    if (protectedFiles.includes(rel)) {
      const destPath = path.join(cwd, rel);
      if (await pathExists(destPath)) {
        skipped.push(rel);
        continue;
      }
    }

    const entry = projectionMap.get(rel);
    if (!entry) {
      throw new Error(`anws: managed file "${rel}" has no projection entry — manifest/registry mismatch`);
    }

    const destPath = path.join(cwd, rel);
    await fs.mkdir(path.dirname(destPath), { recursive: true });

    const srcPath = resolveCanonicalSource(entry.source);
    if (!(await pathExists(srcPath))) {
      throw new Error(
        `anws: missing canonical template for "${rel}" (${entry.source}). Expected: ${srcPath}`
      );
    }
    await fs.copyFile(srcPath, destPath);
    written.push(rel);
  }

  return {
    targetId: targetPlan.targetId,
    targetLabel: targetPlan.targetLabel,
    written,
    skipped
  };
}

module.exports = { copyDir, writeTargetFiles };
