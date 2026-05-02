'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { buildProjectionPlan } = require('../lib/manifest');
const { collectManagedFileDiffs } = require('../lib/diff');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('../lib/resources');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-diff-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

test('collectManagedFileDiffs consumes grouped projection plan entries', async () => {
  await withTempDir(async (tempDir) => {
    const plan = buildProjectionPlan(['windsurf']);
    const existingFile = path.join(tempDir, '.windsurf', 'workflows', 'genesis.md');
    await fs.mkdir(path.dirname(existingFile), { recursive: true });
    await fs.writeFile(existingFile, 'outdated content\n', 'utf8');

    const changes = await collectManagedFileDiffs({
      cwd: tempDir,
      projectionPlan: plan,
      srcAgents: ROOT_AGENTS_FILE,
      shouldWriteRootAgents: false
    });

    assert(changes.some((item) => item.file === '.windsurf/workflows/genesis.md'));
    assert(changes.some((item) => item.type === 'modified' || item.type === 'added'));
    assert.equal(plan[0].projectionEntries[0].targetId, 'windsurf');
  });
});

test('collectManagedFileDiffs still supports explicit projectionEntries input', async () => {
  await withTempDir(async (tempDir) => {
    const plan = buildProjectionPlan(['codex']);
    const entry = plan[0].projectionEntries.find((item) => item.outputPath === '.codex/skills/anws-system/references/genesis.md');
    const srcPath = resolveCanonicalSource(entry.source);

    await fs.mkdir(path.dirname(path.join(tempDir, entry.outputPath)), { recursive: true });
    await fs.copyFile(srcPath, path.join(tempDir, entry.outputPath));

    const changes = await collectManagedFileDiffs({
      cwd: tempDir,
      managedFiles: [entry.outputPath],
      projectionEntries: [entry],
      srcAgents: ROOT_AGENTS_FILE,
      shouldWriteRootAgents: false
    });

    assert.deepEqual(changes, []);
  });
});

test('collectManagedFileDiffs throws when canonical template source is missing', async () => {
  await withTempDir(async (tempDir) => {
    const bogusEntry = {
      id: 'bogus',
      type: 'workflow',
      source: '.agents/workflows/__missing_canonical_fixture__.md',
      fileName: 'genesis.md',
      projectionType: 'workflows',
      outputRoot: '.windsurf/workflows',
      outputPath: '.windsurf/workflows/genesis.md',
      targetId: 'windsurf',
      targetLabel: 'Windsurf',
      ownershipKey: 'windsurf:.windsurf/workflows/genesis.md'
    };

    await assert.rejects(
      () =>
        collectManagedFileDiffs({
          cwd: tempDir,
          managedFiles: [bogusEntry.outputPath],
          projectionEntries: [bogusEntry],
          srcAgents: ROOT_AGENTS_FILE,
          shouldWriteRootAgents: false
        }),
      /missing canonical template/i
    );
  });
});
