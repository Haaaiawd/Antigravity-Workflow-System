'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-update-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function runCliInDir(cwd, args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
}

test('anws update --check detects the windsurf target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /Already up to date|ANWS UPDATE PREVIEW/);
  });
});

test('anws update --check detects the antigravity target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'antigravity']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /Already up to date|ANWS UPDATE PREVIEW/);
  });
});
