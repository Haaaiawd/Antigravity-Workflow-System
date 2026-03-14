'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { detectInstalledTarget } = require('../lib/adapters');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-adapters-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

test('detectInstalledTarget returns windsurf when .windsurf layout exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'windsurf');
  });
});

test('detectInstalledTarget returns codex when .codex layout exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.codex', 'skills'), { recursive: true });

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'codex');
  });
});

test('detectInstalledTarget returns null when no supported layout exists', async () => {
  await withTempDir(async (tempDir) => {
    const target = await detectInstalledTarget(tempDir);

    assert.equal(target, null);
  });
});
