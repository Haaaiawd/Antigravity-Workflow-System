'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MANAGED_FILES,
  USER_PROTECTED_FILES,
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
