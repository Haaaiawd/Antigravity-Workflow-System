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

async function seedOlderChangelog(cwd, version = '2.0.4') {
  const changelogDir = path.join(cwd, '.anws', 'changelog');
  await fs.mkdir(changelogDir, { recursive: true });
  await fs.writeFile(path.join(changelogDir, `v${version}.md`), `# 升级记录: v${version}\n`, 'utf8');
}

test('anws update performs one-click update for the windsurf target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Update completed/);
    assert.match(updateResult.stdout, /Windsurf \(windsurf\)/);
  });
});

test('anws update performs one-click update for the antigravity target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'antigravity']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Update completed/);
    assert.match(updateResult.stdout, /Antigravity \(antigravity\)/);
  });
});

test('anws update reports all matched targets from install-lock and scan', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Matched targets:/);
    assert.match(updateResult.stdout, /Windsurf \(windsurf\)/);
    assert.match(updateResult.stdout, /Codex \(Preview\) \(codex\)/);
    assert.match(updateResult.stdout, /Update completed/);
  });
});

test('anws update falls back to directory scan when install-lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);
    await fs.rm(path.join(tempDir, '.anws', 'install-lock.json'), { force: true });

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /State source: directory scan fallback/);
    assert.match(updateResult.stdout, /Windsurf \(windsurf\)/);
    assert.match(updateResult.stdout, /Update completed/);
  });
});

test('anws update rebuilds install-lock from detected targets when already up to date', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);
    const firstUpdateResult = runCliInDir(tempDir, ['update', '--yes']);
    assert.equal(firstUpdateResult.status, 0, firstUpdateResult.stderr || firstUpdateResult.stdout);
    await fs.rm(path.join(tempDir, '.anws', 'install-lock.json'), { force: true });

    const updateResult = runCliInDir(tempDir, ['update', '--yes']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /State source: directory scan fallback/);
    assert.match(updateResult.stdout, /Rebuilt \.anws\/install-lock\.json from the detected target layout\./);
    assert.match(updateResult.stdout, /Already up to date/);

    const lock = JSON.parse(await fs.readFile(path.join(tempDir, '.anws', 'install-lock.json'), 'utf8'));
    assert.deepEqual(lock.targets.map((item) => item.targetId), ['codex', 'windsurf']);
    assert.deepEqual(lock.lastUpdateSummary.successfulTargets, []);
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, []);
  });
});

test('anws update runs without interactive confirmation in non-TTY environments', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);
    await seedOlderChangelog(tempDir);
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'change.md'), '# stale workflow\n', 'utf8');

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Target selection/);
    assert.match(updateResult.stdout, /Update completed/);
    assert.doesNotMatch(updateResult.stdout, /Aborted\. No files were changed\./);
    assert.doesNotMatch(updateResult.stdout, /Non-TTY environment detected\. Skipping update/);
  });
});

test('anws update changelog merges semantically duplicated multi-target changes into one detail section', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,opencode']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);
    await seedOlderChangelog(tempDir);

    const staleContent = '# stale change workflow\n';
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'change.md'), staleContent, 'utf8');
    await fs.writeFile(path.join(tempDir, '.opencode', 'commands', 'change.md'), staleContent, 'utf8');

    const updateResult = runCliInDir(tempDir, ['update']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);

    const changelog = await fs.readFile(path.join(tempDir, '.anws', 'changelog', 'v2.1.0.md'), 'utf8');
    const headingMatches = changelog.match(/### `\.agents\/workflows\/change\.md`/g) || [];

    assert.equal(headingMatches.length, 1);
    assert.match(changelog, /影响 Targets.*OpenCode \(opencode\), Windsurf \(windsurf\)|影响 Targets.*Windsurf \(windsurf\), OpenCode \(opencode\)/);
    assert.match(changelog, /`\.opencode\/commands\/change\.md`/);
    assert.match(changelog, /`\.windsurf\/workflows\/change\.md`/);
  });
});

test('anws update migrates legacy .agent into antigravity target layout', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.agent', 'rules'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.agent', 'rules', 'agents.md'), '# AGENTS.md - AI 协作协议\n\nlegacy', 'utf8');

    const updateResult = runCliInDir(tempDir, ['update', '--yes']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Legacy migration/);
    assert.match(updateResult.stdout, /Update completed/);
    assert.match(updateResult.stdout, /Done! \d+ file\(s\) updated/);

    const workflowExists = await fs.access(path.join(tempDir, '.agents', 'workflows', 'genesis.md')).then(() => true).catch(() => false);
    const skillExists = await fs.access(path.join(tempDir, '.agents', 'skills', 'spec-writer', 'SKILL.md')).then(() => true).catch(() => false);
    const rootAgentsExists = await fs.access(path.join(tempDir, 'AGENTS.md')).then(() => true).catch(() => false);

    assert.equal(workflowExists, true);
    assert.equal(skillExists, true);
    assert.equal(rootAgentsExists, true);
  });
});

test('anws update keeps successful targets in lock and reports failed targets separately', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    await fs.rm(path.join(tempDir, '.anws', 'changelog'), { recursive: true, force: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex skill', 'utf8');
    await fs.rm(path.join(tempDir, '.codex', 'skills', 'nexus-mapper', 'references'), { recursive: true, force: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'nexus-mapper', 'references'), 'blocked codex directory', 'utf8');

    const updateResult = runCliInDir(tempDir, ['update', '--yes']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Update summary by target/);
    assert.match(updateResult.stdout, /Update completed/);
    assert.match(updateResult.stdout, /Windsurf \(windsurf\)/);
    assert.match(updateResult.stdout, /Codex \(Preview\) \(codex\)/);

    const lock = JSON.parse(await fs.readFile(path.join(tempDir, '.anws', 'install-lock.json'), 'utf8'));
    assert(lock.lastUpdateSummary.successfulTargets.includes('windsurf'));
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, ['codex']);

    const changelogFiles = await fs.readdir(path.join(tempDir, '.anws', 'changelog'));
    const changelogFile = changelogFiles.find((name) => /^v\d+\.\d+\.\d+\.md$/.test(name));
    const changelog = await fs.readFile(path.join(tempDir, '.anws', 'changelog', changelogFile), 'utf8');
    assert.match(changelog, /成功 Targets/);
    assert.match(changelog, /失败 Targets/);
    assert.match(changelog, /Codex \(Preview\) \(codex\)/);
  });
});



