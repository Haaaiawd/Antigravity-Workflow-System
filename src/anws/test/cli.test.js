'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');
const packageRoot = path.join(__dirname, '..');

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
    ...options
  });
}

test('cli help documents init target option and one-click update flow', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /--target/);
  assert.match(result.stdout, /for init/);
  assert.match(result.stdout, /windsurf/);
  assert.match(result.stdout, /antigravity/);
  assert.match(result.stdout, /One-click update/);
  assert.doesNotMatch(result.stdout, /update --target/);
  assert.doesNotMatch(result.stdout, /update --check/);
});

test('cli exits with an error for unsupported target ids', () => {
  const result = runCli(['init', '--target', 'invalid-target'], {
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Unsupported target: invalid-target/);
});

test('cli accepts comma-separated target ids for init', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /comma-separated/);
  assert.match(result.stdout, /windsurf/);
  assert.match(result.stdout, /codex/);
});

test('cli rejects removed update flags', () => {
  const targetResult = runCli(['update', '--target', 'windsurf'], {
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  const checkResult = runCli(['update', '--check'], {
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  assert.notEqual(targetResult.status, 0);
  assert.match(targetResult.stderr + targetResult.stdout, /`anws update --target` has been removed/);
  assert.notEqual(checkResult.status, 0);
  assert.match(checkResult.stderr + checkResult.stdout, /`anws update --check` has been removed/);
});
