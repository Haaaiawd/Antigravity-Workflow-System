'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { groupChanges } = require('./diff');

const README_CONTENT = `# ⚠️ 重要：请勿删除此目录！

## 这个目录是做什么的？

\`.anws/changelog/\` 存放每次 \`anws update\` 生成的升级记录。

## 为什么不能删除？

1. **AI 升级判断依赖此目录**
   - AI 需要读取历史升级记录来判断变更级别
   - 删除后将导致 AI 无法准确判断升级影响

2. **业务文档升级的依据**
   - 升级记录包含详细的变更详情
   - AI 根据这些记录升级你的业务文档

3. **回滚依据**
   - 如果升级出现问题，可以参考历史记录回滚

## 文件命名规则

- \`v1.4.0.md\` - v1.4.0 的变更记录
- \`v1.5.0.md\` - v1.5.0 的变更记录

## 可以删除单个文件吗？

**不建议**。每个文件都是升级历史的一部分，删除会影响 AI 的判断能力。
`;

async function ensureChangelogDir(cwd) {
  const changelogDir = path.join(cwd, '.anws', 'changelog');
  await fs.mkdir(changelogDir, { recursive: true });
  await fs.writeFile(path.join(changelogDir, '.gitkeep'), '', 'utf8');
  await fs.writeFile(path.join(changelogDir, 'README.md'), README_CONTENT, 'utf8');
  return changelogDir;
}

function compareSemver(a, b) {
  const aParts = String(a).split('.').map((item) => Number(item));
  const bParts = String(b).split('.').map((item) => Number(item));

  for (let index = 0; index < 3; index += 1) {
    const left = aParts[index] || 0;
    const right = bParts[index] || 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
}

function normalizeText(text) {
  return String(text || '').replace(/\r\n/g, '\n');
}

function buildMergedChangeKey(item) {
  const canonicalPath = item.source || item.file;
  const summaryKey = JSON.stringify(item.summary || []);
  const contentKey = item.type === 'modified'
    ? summaryKey
    : `${normalizeText(item.oldContent)}\n<<<ANWS_CHANGE_SPLIT>>>\n${normalizeText(item.newContent)}`;

  return `${item.type}::${canonicalPath}::${item.resourceId || canonicalPath}::${contentKey}`;
}

function mergeChanges(changes) {
  const grouped = new Map();

  for (const item of changes) {
    const canonicalPath = item.source || item.file;
    const key = buildMergedChangeKey(item);
    const affectedFile = {
      file: item.file,
      targetId: item.targetId || null,
      targetLabel: item.targetLabel || null
    };

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...item,
        canonicalPath,
        affectedFiles: [affectedFile]
      });
      continue;
    }

    const current = grouped.get(key);
    current.affectedFiles.push(affectedFile);
  }

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    affectedFiles: item.affectedFiles.sort((left, right) => left.file.localeCompare(right.file))
  }));
}

function formatAffectedTargetList(item) {
  const targets = Array.from(new Set(
    item.affectedFiles
      .filter((entry) => entry.targetId && entry.targetLabel)
      .map((entry) => `${entry.targetLabel} (${entry.targetId})`)
  ));

  return targets.length > 0 ? targets.join(', ') : '无';
}

function formatFileList(title, items) {
  const lines = [`### ${title}`];
  if (items.length === 0) {
    lines.push('- 无');
    return lines.join('\n');
  }

  for (const item of items) {
    lines.push(`- \`${item.canonicalPath}\` — 影响 Targets: ${formatAffectedTargetList(item)}`);
    for (const affectedFile of item.affectedFiles) {
      lines.push(`  - \`${affectedFile.file}\``);
    }
  }

  return lines.join('\n');
}

function formatDetail(item) {
  if (item.type === 'added') {
    return [
      `### \`${item.canonicalPath}\``,
      `- **影响 Targets**: ${formatAffectedTargetList(item)}`,
      '- **影响文件**:',
      ...item.affectedFiles.map((entry) => `  - \`${entry.file}\``),
      '- **新增文件**',
      '- **说明**: 该文件在旧版本中不存在，因此无前后逐行对比。'
    ].join('\n');
  }

  if (item.type === 'deleted') {
    return [
      `### \`${item.canonicalPath}\``,
      `- **影响 Targets**: ${formatAffectedTargetList(item)}`,
      '- **影响文件**:',
      ...item.affectedFiles.map((entry) => `  - \`${entry.file}\``),
      '- **删除文件**',
      '- **说明**: 该文件在新版本中不存在，因此无前后逐行对比。'
    ].join('\n');
  }

  if (item.summary.length === 0) {
    return [
      `### \`${item.canonicalPath}\``,
      `- **影响 Targets**: ${formatAffectedTargetList(item)}`,
      '- **影响文件**:',
      ...item.affectedFiles.map((entry) => `  - \`${entry.file}\``),
      '- **说明**: 检测到内容变更，但未能提取到摘要。'
    ].join('\n');
  }

  return [
    `### \`${item.canonicalPath}\``,
    `- **影响 Targets**: ${formatAffectedTargetList(item)}`,
    '- **影响文件**:',
    ...item.affectedFiles.map((entry) => `  - \`${entry.file}\``),
    '```diff',
    ...item.summary.flatMap((pair) => [
      `- [old:${pair.oldLineNumber === null ? '-' : pair.oldLineNumber}] ${pair.oldText}`,
      `+ [new:${pair.newLineNumber === null ? '-' : pair.newLineNumber}] ${pair.newText}`
    ]),
    '```'
  ].join('\n');
}

async function generateChangelog({ cwd, version, changes, targetSummary = null }) {
  const changelogDir = await ensureChangelogDir(cwd);
  const mergedChanges = mergeChanges(changes);
  const grouped = groupChanges(mergedChanges);
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
  const filePath = path.join(changelogDir, `v${version}.md`);

  const content = [
    `# 升级记录: v${version}`,
    '',
    '> ⚠️ **此文件由 `anws update` 自动生成，请勿删除！**',
    '> 删除后将导致 AI 无法获取历史升级信息，影响后续升级判断。',
    '',
    '## 元信息',
    `- **升级版本**: ${version}`,
    `- 升级时间: ${timestamp}`,
    '- **升级类型**: 由 `/upgrade` 工作流判断 (Minor/Major)',
    ...(targetSummary
      ? [
          `- **成功 Targets**: ${targetSummary.successfulTargets.length > 0 ? targetSummary.successfulTargets.join(', ') : '无'}`,
          `- **失败 Targets**: ${targetSummary.failedTargets.length > 0 ? targetSummary.failedTargets.join(', ') : '无'}`
        ]
      : []),
    '',
    '## 变更摘要',
    `- 新增文件: ${grouped.added.length}`,
    `- 修改文件: ${grouped.modified.length}`,
    `- 删除文件: ${grouped.deleted.length}`,
    '',
    '## 文件级变更清单',
    '',
    formatFileList('新增文件', grouped.added),
    '',
    formatFileList('修改文件', grouped.modified),
    '',
    formatFileList('删除文件', grouped.deleted),
    '',
    '## 内容级变更详情',
    '',
    ...(mergedChanges.length > 0 ? mergedChanges.map(formatDetail).flatMap((section) => [section, '']) : ['- 无变更', ''])
  ].join('\n');

  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}

async function detectUpgrade({ cwd, version }) {
  const changelogDir = path.join(cwd, '.anws', 'changelog');

  try {
    const files = await fs.readdir(changelogDir);
    const latest = files
      .filter((name) => /^v\d+\.\d+\.\d+\.md$/.test(name))
      .sort((left, right) => {
        const leftVersion = left.slice(1, -3);
        const rightVersion = right.slice(1, -3);
        return compareSemver(leftVersion, rightVersion);
      })
      .pop();

    if (!latest) {
      return { needUpgrade: true, fromVersion: null, toVersion: version, latestVersion: null };
    }

    const fromVersion = latest.slice(1, -3);
    return {
      needUpgrade: compareSemver(fromVersion, version) !== 0,
      fromVersion,
      toVersion: version,
      latestVersion: fromVersion
    };
  } catch {
    return { needUpgrade: true, fromVersion: null, toVersion: version, latestVersion: null };
  }
}

module.exports = {
  detectUpgrade,
  ensureChangelogDir,
  generateChangelog
};
