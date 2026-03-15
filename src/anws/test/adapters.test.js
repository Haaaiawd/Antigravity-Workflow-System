'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { detectInstalledTarget, detectInstalledTargets, getTarget, listTargets } = require('../lib/adapters');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-adapters-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

test('detectInstalledTarget returns windsurf when the windsurf sentinel exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), '# windsurf genesis', 'utf8');

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'windsurf');
  });
});

test('detectInstalledTarget returns codex when the codex sentinel exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.codex', 'skills', 'anws-system'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex skill', 'utf8');

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

test('detectInstalledTarget does not treat a plain .claude directory as an anws installation', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.claude', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.claude', 'commands', 'local.md'), '# unrelated claude code file', 'utf8');

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target, null);
  });
});

test('detectInstalledTargets does not treat plain target directories as anws installations', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'workflows'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.cursor', 'commands'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.github', 'prompts'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.codex', 'skills'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.opencode', 'commands'), { recursive: true });

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(targets.map((item) => item.id), []);
  });
});

test('listTargets exposes all supported target contracts', () => {
  const targets = listTargets();

  assert.equal(targets.length, 7);
  assert(targets.every((target) => target.id));
  assert(targets.every((target) => target.label));
  assert(targets.every((target) => target.projectionTypes));
  assert(targets.every((target) => target.projections));
  assert(targets.every((target) => Array.isArray(target.detect)));
});

test('listTargets covers the complete first-wave target matrix', () => {
  assert.deepEqual(
    listTargets().map((target) => target.id),
    ['windsurf', 'antigravity', 'cursor', 'claude', 'copilot', 'codex', 'opencode']
  );
});

test('getTarget returns copilot projection contract', () => {
  const target = getTarget('copilot');

  assert.deepEqual(target.projectionTypes.workflow, ['prompts']);
  assert.deepEqual(target.projectionTypes.skill, ['skills']);
  assert.equal(target.projections.prompts, '.github/prompts');
  assert.equal(target.projections.skills, '.github/skills');
});

test('getTarget reports supported targets for unsupported ids', () => {
  assert.throws(
    () => getTarget('unknown'),
    /Unsupported target: unknown\. Supported targets:/
  );
});

test('getTarget returns stable detection metadata for all supported targets', () => {
  for (const target of listTargets()) {
    const resolved = getTarget(target.id);

    assert.equal(resolved.id, target.id);
    assert.equal(typeof resolved.rootAgentFile, 'boolean');
    assert(resolved.detect.length > 0);
    assert(resolved.detect.every((item) => typeof item === 'string' && item.length > 0));
  }
});

test('detectInstalledTargets returns multiple managed layouts when present', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), '# windsurf genesis', 'utf8');
    await fs.mkdir(path.join(tempDir, '.codex', 'skills', 'anws-system'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex skill', 'utf8');

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(targets.map((item) => item.id), ['windsurf', 'codex']);
  });
});

test('detectInstalledTargets can distinguish the supported matrix from sentinel files', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), '# windsurf genesis', 'utf8');
    await fs.mkdir(path.join(tempDir, '.agents', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.agents', 'workflows', 'genesis.md'), '# antigravity genesis', 'utf8');
    await fs.mkdir(path.join(tempDir, '.cursor', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.cursor', 'commands', 'genesis.md'), '# cursor genesis', 'utf8');
    await fs.mkdir(path.join(tempDir, '.github', 'prompts'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.github', 'prompts', 'genesis.prompt.md'), '# copilot genesis', 'utf8');
    await fs.mkdir(path.join(tempDir, '.codex', 'skills', 'anws-system'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex skill', 'utf8');
    await fs.mkdir(path.join(tempDir, '.opencode', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.opencode', 'commands', 'genesis.md'), '# opencode genesis', 'utf8');

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(
      targets.map((item) => item.id),
      ['windsurf', 'antigravity', 'cursor', 'copilot', 'codex', 'opencode']
    );
  });
});



test('detectInstalledTarget recognizes antigravity from legacy .agent workflow sentinel', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.agent', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.agent', 'workflows', 'genesis.md'), '# legacy genesis', 'utf8');

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'antigravity');
  });
});

test('detectInstalledTargets recognizes all targets from workflow sentinel files', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), '# windsurf', 'utf8');

    await fs.mkdir(path.join(tempDir, '.agent', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.agent', 'workflows', 'genesis.md'), '# antigravity legacy', 'utf8');

    await fs.mkdir(path.join(tempDir, '.cursor', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.cursor', 'commands', 'genesis.md'), '# cursor', 'utf8');

    await fs.mkdir(path.join(tempDir, '.claude', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.claude', 'commands', 'genesis.md'), '# claude', 'utf8');

    await fs.mkdir(path.join(tempDir, '.github', 'prompts'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.github', 'prompts', 'genesis.prompt.md'), '# copilot', 'utf8');

    await fs.mkdir(path.join(tempDir, '.codex', 'skills', 'anws-system'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex', 'utf8');

    await fs.mkdir(path.join(tempDir, '.opencode', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.opencode', 'commands', 'genesis.md'), '# opencode', 'utf8');

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(
      targets.map((item) => item.id),
      ['windsurf', 'antigravity', 'cursor', 'claude', 'copilot', 'codex', 'opencode']
    );
  });
});
