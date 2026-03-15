'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MANAGED_FILES,
  USER_PROTECTED_FILES,
  buildManagedManifest,
  buildProjectionEntries,
  buildManagedFiles,
  findByType
} = require('../lib/manifest');

test('legacy MANAGED_FILES stays aligned with antigravity target', () => {
  assert.deepEqual(MANAGED_FILES, buildManagedFiles('antigravity'));
});

test('windsurf managed files map workflows and skills into .windsurf', () => {
  const files = buildManagedFiles('windsurf');

  assert(files.includes('.windsurf/workflows/genesis.md'));
  assert(files.includes('.windsurf/skills/spec-writer/SKILL.md'));
  assert(!files.includes('AGENTS.md'));
});

test('codex managed files include prompts and skills', () => {
  const files = buildManagedFiles('codex');

  assert(files.includes('.codex/prompts/genesis.md'));
  assert(files.includes('.codex/skills/spec-writer/SKILL.md'));
});

test('copilot managed files include prompts and agents', () => {
  const files = buildManagedFiles('copilot');

  assert(files.includes('.github/prompts/genesis.md'));
  assert(files.includes('.github/agents/genesis.md'));
});

test('buildProjectionEntries uses target projection metadata for cursor commands', () => {
  const entries = buildProjectionEntries('cursor');

  assert(entries.some((item) => item.outputPath === '.cursor/commands/genesis.md'));
  assert(entries.some((item) => item.outputPath === '.cursor/commands/spec-writer.md'));
});

test('buildManagedManifest groups ownership by target and preserves antigravity root agent file', () => {
  const manifest = buildManagedManifest(['antigravity', 'codex']);

  assert(manifest.some((item) => item.targetId === 'antigravity' && item.outputPath === 'AGENTS.md'));
  assert(manifest.some((item) => item.targetId === 'codex' && item.outputPath === '.codex/prompts/genesis.md'));
  assert(manifest.every((item) => typeof item.ownershipKey === 'string' && item.ownershipKey.length > 0));
});

test('buildManagedManifest rejects unsupported targets with supported list', () => {
  assert.throws(
    () => buildManagedManifest('unknown'),
    /Unsupported target: unknown\. Supported targets:/
  );
});

test('user protected files are target-aware', () => {
  assert.deepEqual(USER_PROTECTED_FILES, ['AGENTS.md']);
  assert.deepEqual(buildManagedFiles('windsurf').filter((item) => USER_PROTECTED_FILES.includes(item)), []);
});

test('resource registry exposes workflows and skills', () => {
  const workflows = findByType('workflow');
  const skills = findByType('skill');

  assert(workflows.some((item) => item.id === 'genesis'));
  assert(skills.some((item) => item.id === 'spec-writer'));
});
