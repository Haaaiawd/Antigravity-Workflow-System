'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { c } = require('./output');

async function pathExists(targetPath) {
  return fs.access(targetPath).then(() => true).catch(() => false);
}

async function readTextOrEmpty(filePath) {
  const exists = await pathExists(filePath);
  if (!exists) return '';
  return fs.readFile(filePath, 'utf8');
}

function normalize(text) {
  return text.replace(/\r\n/g, '\n');
}

function toLines(text) {
  const lines = normalize(text).split('\n');
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function createLineDiff(oldContent, newContent, maxPairs = 8) {
  const before = toLines(oldContent);
  const after = toLines(newContent);
  const pairs = [];
  let beforeIndex = 0;
  let afterIndex = 0;

  while (beforeIndex < before.length || afterIndex < after.length) {
    const oldLine = before[beforeIndex];
    const newLine = after[afterIndex];

    if (oldLine === newLine) {
      beforeIndex += 1;
      afterIndex += 1;
      continue;
    }

    const nextOldLine = before[beforeIndex + 1];
    const nextNewLine = after[afterIndex + 1];

    if (nextOldLine === newLine) {
      pairs.push({
        oldLineNumber: oldLine === undefined ? null : beforeIndex + 1,
        newLineNumber: null,
        oldText: oldLine === undefined ? '' : oldLine,
        newText: '',
        kind: 'removed'
      });
      beforeIndex += 1;
      if (pairs.length >= maxPairs) break;
      continue;
    }

    if (oldLine === nextNewLine) {
      pairs.push({
        oldLineNumber: null,
        newLineNumber: newLine === undefined ? null : afterIndex + 1,
        oldText: '',
        newText: newLine === undefined ? '' : newLine,
        kind: 'added'
      });
      afterIndex += 1;
      if (pairs.length >= maxPairs) break;
      continue;
    }

    pairs.push({
      oldLineNumber: oldLine === undefined ? null : beforeIndex + 1,
      newLineNumber: newLine === undefined ? null : afterIndex + 1,
      oldText: oldLine === undefined ? '' : oldLine,
      newText: newLine === undefined ? '' : newLine,
      kind:
        oldLine === undefined
          ? 'added'
          : newLine === undefined
            ? 'removed'
            : 'modified'
    });

    beforeIndex += 1;
    afterIndex += 1;

    if (pairs.length >= maxPairs) break;
  }

  return pairs;
}

function formatLineNumber(value) {
  return value === null ? '-' : String(value);
}

function toLegacyManagedPath(rel) {
  if (!rel.startsWith('.agents/')) return rel;
  return `.agent/${rel.slice('.agents/'.length)}`;
}

async function resolveExistingManagedPath(cwd, rel) {
  const primaryPath = path.join(cwd, rel);
  if (await pathExists(primaryPath)) {
    return { file: rel, absolutePath: primaryPath, sourceKind: 'current' };
  }

  const legacyRel = toLegacyManagedPath(rel);
  if (legacyRel !== rel) {
    const legacyPath = path.join(cwd, legacyRel);
    if (await pathExists(legacyPath)) {
      return { file: rel, absolutePath: legacyPath, sourceKind: 'legacy' };
    }
  }

  return { file: rel, absolutePath: primaryPath, sourceKind: 'missing' };
}

async function collectManagedFileDiffs({
  cwd,
  managedFiles,
  projectionPlan = [],
  projectionEntries = [],
  srcAgents,
  shouldWriteRootAgents,
  agentsUpdatePlan = null
}) {
  const results = [];
  const normalizedProjectionEntries = projectionEntries.length > 0
    ? projectionEntries
    : projectionPlan.flatMap((item) => item.projectionEntries || []);
  const normalizedManagedFiles = managedFiles && managedFiles.length > 0
    ? managedFiles
    : projectionPlan.flatMap((item) => item.managedFiles || []);
  const projectionMap = new Map(normalizedProjectionEntries.map((item) => [item.outputPath, item]));
  const fallbackTarget = projectionPlan[0] || null;

  for (const rel of normalizedManagedFiles) {
    if (rel === 'AGENTS.md' && !shouldWriteRootAgents) {
      continue;
    }

    const entry = projectionMap.get(rel);
    if (!entry && rel !== 'AGENTS.md') {
      throw new Error(`anws: managed file "${rel}" has no projection entry — manifest/registry mismatch`);
    }

    const metadata = entry
      ? {
          source: entry.source,
          resourceId: entry.id,
          targetId: entry.targetId,
          targetLabel: entry.targetLabel
        }
      : {
          source: rel,
          resourceId: rel === 'AGENTS.md' ? 'root-agents' : rel,
          targetId: fallbackTarget?.targetId || null,
          targetLabel: fallbackTarget?.targetLabel || null
        };
    const srcPath = rel === 'AGENTS.md'
      ? srcAgents
      : path.join(path.join(__dirname, '..', 'templates'), entry.source);

    if (rel !== 'AGENTS.md' && !(await pathExists(srcPath))) {
      throw new Error(
        `anws: missing canonical template for "${rel}" (${entry.source}). Expected: ${srcPath}`
      );
    }

    const existing = rel === 'AGENTS.md'
      ? { file: rel, absolutePath: path.join(cwd, rel), sourceKind: 'current' }
      : await resolveExistingManagedPath(cwd, rel);
    const destPath = existing.absolutePath;

    const srcExists = await pathExists(srcPath);
    const destExists = await pathExists(destPath);

    if (!srcExists && !destExists) continue;

    if (srcExists && !destExists) {
      results.push({
        file: rel,
        ...metadata,
        type: 'added',
        summary: [],
        oldContent: '',
        newContent: await readTextOrEmpty(srcPath)
      });
      continue;
    }

    if (!srcExists && destExists) {
      results.push({
        file: rel,
        ...metadata,
        type: 'deleted',
        summary: [],
        oldContent: await readTextOrEmpty(destPath),
        newContent: ''
      });
      continue;
    }

    const oldContent = await readTextOrEmpty(destPath);
    let newContent = await readTextOrEmpty(srcPath);

    if (rel === 'AGENTS.md' && shouldWriteRootAgents && destExists) {
      if (agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') {
        continue;
      }
      newContent = agentsUpdatePlan ? agentsUpdatePlan.content : newContent;
    }

    if (normalize(oldContent) === normalize(newContent)) continue;

    results.push({
      file: rel,
      ...metadata,
      type: 'modified',
      summary: createLineDiff(oldContent, newContent),
      oldContent,
      newContent
    });
  }

  return results;
}

function groupChanges(changes) {
  return {
    added: changes.filter((item) => item.type === 'added'),
    modified: changes.filter((item) => item.type === 'modified'),
    deleted: changes.filter((item) => item.type === 'deleted')
  };
}

function printColorBlock(title, color, items, prefix) {
  if (items.length === 0) return;
  console.log(`  ${color}${title} (${items.length})${c.reset}`);
  for (const item of items) {
    console.log(`    ${prefix} ${item.file}`);
  }
  console.log('');
}

function printPreview({ fromVersion, toVersion, changes }) {
  const grouped = groupChanges(changes);
  const fromLabel = fromVersion ? `v${fromVersion}` : 'fresh-install';
  const toLabel = `v${toVersion}`;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  ANWS UPDATE PREVIEW - ${fromLabel} → ${toLabel}`.padEnd(63, ' ') + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 文件级变更');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  printColorBlock('新增', c.green, grouped.added, '+');
  printColorBlock('修改', c.yellow, grouped.modified, '~');
  printColorBlock('删除', c.red, grouped.deleted, '-');

  if (grouped.added.length === 0 && grouped.modified.length === 0 && grouped.deleted.length === 0) {
    console.log('  Already up to date.');
    console.log('');
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 内容级变更详情');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  for (const item of grouped.modified) {
    console.log(`${c.yellow}${item.file}${c.reset}`);
    console.log('──────────────────────────────────────────────────────────────');
    for (const pair of item.summary) {
      console.log(`  old ${formatLineNumber(pair.oldLineNumber).padStart(4, ' ')} | ${c.red}-${c.reset} ${pair.oldText}`);
      console.log(`  new ${formatLineNumber(pair.newLineNumber).padStart(4, ' ')} | ${c.green}+${c.reset} ${pair.newText}`);
      console.log('  ----');
    }
    console.log('');
  }

  console.log('执行 `anws update` 以应用以上变更。');
}

module.exports = {
  collectManagedFileDiffs,
  groupChanges,
  printPreview
};
