'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-init-'));
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

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

test('anws init --target windsurf writes only the windsurf projection', async () => {
  await withTempDir(async (tempDir) => {
    const result = runCliInDir(tempDir, ['init', '--target', 'windsurf']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(await exists(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(tempDir, '.windsurf', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(tempDir, 'AGENTS.md')), false);
    assert.equal(await exists(path.join(tempDir, '.agents')), false);
  });
});

test('anws init --target antigravity writes .agents and AGENTS.md', async () => {
  await withTempDir(async (tempDir) => {
    const result = runCliInDir(tempDir, ['init', '--target', 'antigravity']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(await exists(path.join(tempDir, '.agents', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(tempDir, '.agents', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(tempDir, 'AGENTS.md')), true);
  });
});

test('anws init --target windsurf,codex writes multiple target projections and install-lock', async () => {
  await withTempDir(async (tempDir) => {
    const result = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(await exists(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md')), true);
    assert.equal(await exists(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md')), true);
    assert.equal(await exists(path.join(tempDir, '.codex', 'skills', 'anws-system', 'references', 'genesis.md')), true);
    assert.equal(await exists(path.join(tempDir, '.codex', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(tempDir, '.anws', 'install-lock.json')), true);
  });
});

test('anws init --target opencode writes command and skill projections', async () => {
  await withTempDir(async (tempDir) => {
    const result = runCliInDir(tempDir, ['init', '--target', 'opencode']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(await exists(path.join(tempDir, '.opencode', 'commands', 'genesis.md')), true);
    assert.equal(await exists(path.join(tempDir, '.opencode', 'skills', 'spec-writer', 'SKILL.md')), true);
    assert.equal(await exists(path.join(tempDir, '.anws', 'install-lock.json')), true);
  });
});

test('anws init dedupes already selected targets in install-lock', async () => {
  await withTempDir(async (tempDir) => {
    const result = runCliInDir(tempDir, ['init', '--target', 'windsurf,windsurf']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    const lock = JSON.parse(await fs.readFile(path.join(tempDir, '.anws', 'install-lock.json'), 'utf8'));
    assert.equal(lock.targets.length, 1);
    assert.equal(lock.targets[0].targetId, 'windsurf');
  });
});

test('anws init reports partial success and only writes successful targets into install-lock', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), 'user-owned conflict', 'utf8');

    const result = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Target summary/);
    assert.match(result.stdout, /Windsurf \(windsurf\)/);
    assert.match(result.stdout, /Codex \(Preview\) \(codex\)/);

    const lock = JSON.parse(await fs.readFile(path.join(tempDir, '.anws', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((item) => item.targetId), ['codex']);
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, ['windsurf']);
    assert.equal(await exists(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md')), true);
  });
});

