'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  INSTALL_LOCK_RELATIVE_PATH,
  INSTALL_LOCK_VERSION,
  createInstallLock,
  detectInstallState,
  detectLockDrift,
  dedupeTargets,
  getInstallLockPath,
  normalizeInstallLock,
  readInstallLock,
  writeInstallLock
} = require('../lib/install-state');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-install-state-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

test('createInstallLock produces schema-compliant lock payload', () => {
  const lock = createInstallLock({
    cliVersion: '1.3.0',
    generatedAt: '2026-03-15T10:18:00.000Z',
    targets: [
      {
        targetId: 'windsurf',
        targetLabel: 'Windsurf',
        installedVersion: '1.3.0',
        managedFiles: ['.windsurf/workflows/genesis.md'],
        ownership: ['windsurf:.windsurf/workflows/genesis.md']
      }
    ],
    lastUpdateSummary: {
      successfulTargets: ['windsurf'],
      failedTargets: [],
      updatedAt: '2026-03-15T10:18:00.000Z'
    }
  });

  assert.equal(lock.schemaVersion, INSTALL_LOCK_VERSION);
  assert.equal(lock.cliVersion, '1.3.0');
  assert.equal(lock.targets.length, 1);
  assert.equal(lock.targets[0].targetId, 'windsurf');
});

test('dedupeTargets keeps the latest record per target id', () => {
  const targets = dedupeTargets([
    {
      targetId: 'codex',
      targetLabel: 'Codex (Preview)',
      installedVersion: '1.2.0',
      managedFiles: ['.codex/skills/anws-system/SKILL.md'],
      ownership: ['codex:.codex/skills/anws-system/SKILL.md']
    },
    {
      targetId: 'codex',
      targetLabel: 'Codex (Preview)',
      installedVersion: '1.3.0',
      managedFiles: ['.codex/skills/anws-system/references/forge.md'],
      ownership: ['codex:.codex/skills/anws-system/references/forge.md']
    }
  ]);

  assert.equal(targets.length, 1);
  assert.equal(targets[0].installedVersion, '1.3.0');
  assert.deepEqual(targets[0].managedFiles, ['.codex/skills/anws-system/references/forge.md']);
});

test('writeInstallLock persists install-lock under .anws/install-lock.json', async () => {
  await withTempDir(async (tempDir) => {
    const lock = createInstallLock({
      cliVersion: '1.3.0',
      generatedAt: '2026-03-15T10:18:00.000Z',
      targets: [
        {
          targetId: 'antigravity',
          targetLabel: 'Antigravity',
          installedVersion: '1.3.0',
          managedFiles: ['AGENTS.md', '.agents/workflows/genesis.md'],
          ownership: ['antigravity:AGENTS.md', 'antigravity:.agents/workflows/genesis.md']
        }
      ]
    });

    const result = await writeInstallLock(tempDir, lock);
    const written = JSON.parse(await fs.readFile(result.lockPath, 'utf8'));

    assert.equal(result.lockPath, getInstallLockPath(tempDir));
    assert.equal(path.relative(tempDir, result.lockPath).replace(/\\/g, '/'), INSTALL_LOCK_RELATIVE_PATH);
    assert.equal(written.schemaVersion, INSTALL_LOCK_VERSION);
    assert.equal(written.targets[0].targetId, 'antigravity');
  });
});

test('readInstallLock returns parsed lock when file is valid', async () => {
  await withTempDir(async (tempDir) => {
    const lock = createInstallLock({
      cliVersion: '1.3.0',
      generatedAt: '2026-03-15T10:18:00.000Z',
      targets: [
        {
          targetId: 'cursor',
          targetLabel: 'Cursor',
          installedVersion: '1.3.0',
          managedFiles: ['.cursor/commands/genesis.md'],
          ownership: ['cursor:.cursor/commands/genesis.md']
        }
      ]
    });

    await writeInstallLock(tempDir, lock);
    const result = await readInstallLock(tempDir);

    assert.equal(result.exists, true);
    assert.equal(result.error, null);
    assert.equal(result.lock.targets[0].targetId, 'cursor');
  });
});

test('readInstallLock returns recognizable error for invalid json', async () => {
  await withTempDir(async (tempDir) => {
    const lockPath = getInstallLockPath(tempDir);
    await fs.mkdir(path.dirname(lockPath), { recursive: true });
    await fs.writeFile(lockPath, '{invalid json', 'utf8');

    const result = await readInstallLock(tempDir);

    assert.equal(result.exists, true);
    assert.equal(result.lock, null);
    assert.match(result.error.message, /Failed to read install-lock:/);
  });
});

test('normalizeInstallLock rejects missing required fields', () => {
  assert.throws(
    () => normalizeInstallLock({
      schemaVersion: 1,
      generatedAt: '2026-03-15T10:18:00.000Z',
      targets: []
    }),
    /cliVersion must be a non-empty string/
  );
});

test('normalizeInstallLock preserves summary and target metadata for valid payloads', () => {
  const normalized = normalizeInstallLock({
    schemaVersion: INSTALL_LOCK_VERSION,
    cliVersion: '1.3.0',
    generatedAt: '2026-03-15T10:18:00.000Z',
    targets: [
      {
        targetId: 'claude',
        targetLabel: 'Claude',
        installedVersion: '1.3.0',
        managedFiles: ['.claude/commands/genesis.md'],
        ownership: ['claude:.claude/commands/genesis.md']
      }
    ],
    lastUpdateSummary: {
      successfulTargets: ['claude'],
      failedTargets: ['codex'],
      updatedAt: '2026-03-15T10:20:00.000Z'
    }
  });

  assert.equal(normalized.targets[0].targetId, 'claude');
  assert.deepEqual(normalized.lastUpdateSummary.successfulTargets, ['claude']);
  assert.deepEqual(normalized.lastUpdateSummary.failedTargets, ['codex']);
});

test('detectLockDrift reports missing and untracked targets', () => {
  const drift = detectLockDrift({
    targets: [
      {
        targetId: 'windsurf',
        targetLabel: 'Windsurf',
        installedVersion: '1.3.0',
        managedFiles: [],
        ownership: []
      }
    ]
  }, [{ id: 'codex' }]);

  assert.equal(drift.hasDrift, true);
  assert.deepEqual(drift.missingOnDisk, ['windsurf']);
  assert.deepEqual(drift.untrackedOnDisk, ['codex']);
});

test('detectInstallState falls back to scanned targets when lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.windsurf', 'workflows', 'genesis.md'), '# windsurf genesis', 'utf8');

    const result = await detectInstallState(tempDir);

    assert.equal(result.needsFallback, true);
    assert.deepEqual(result.selectedTargets, ['windsurf']);
    assert.equal(result.scannedTargets[0].id, 'windsurf');
  });
});

test('detectInstallState prefers lock targets while still reporting scan drift', async () => {
  await withTempDir(async (tempDir) => {
    const lock = createInstallLock({
      cliVersion: '1.3.0',
      generatedAt: '2026-03-15T10:18:00.000Z',
      targets: [
        {
          targetId: 'cursor',
          targetLabel: 'Cursor',
          installedVersion: '1.3.0',
          managedFiles: ['.cursor/commands/genesis.md'],
          ownership: ['cursor:.cursor/commands/genesis.md']
        }
      ]
    });

    await writeInstallLock(tempDir, lock);
    await fs.mkdir(path.join(tempDir, '.codex', 'skills', 'anws-system'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'skills', 'anws-system', 'SKILL.md'), '# codex skill', 'utf8');

    const result = await detectInstallState(tempDir);

    assert.equal(result.needsFallback, false);
    assert.deepEqual(result.selectedTargets, ['cursor']);
    assert.equal(result.drift.hasDrift, true);
    assert.deepEqual(result.drift.missingOnDisk, ['cursor']);
    assert.deepEqual(result.drift.untrackedOnDisk, ['codex']);
  });
});

test('detectInstallState falls back to antigravity from legacy sentinel when lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.agent', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.agent', 'workflows', 'genesis.md'), '# legacy genesis', 'utf8');

    const result = await detectInstallState(tempDir);

    assert.equal(result.needsFallback, true);
    assert.deepEqual(result.selectedTargets, ['antigravity']);
    assert.equal(result.scannedTargets[0].id, 'antigravity');
  });
});

test('detectInstallState falls back to copilot from prompt sentinel when lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.github', 'prompts'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.github', 'prompts', 'genesis.prompt.md'), '# copilot', 'utf8');

    const result = await detectInstallState(tempDir);

    assert.equal(result.needsFallback, true);
    assert.deepEqual(result.selectedTargets, ['copilot']);
    assert.equal(result.scannedTargets[0].id, 'copilot');
  });
});

test('detectInstallState falls back to cursor from command sentinel when lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.cursor', 'commands'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.cursor', 'commands', 'genesis.md'), '# cursor', 'utf8');

    const result = await detectInstallState(tempDir);

    assert.equal(result.needsFallback, true);
    assert.deepEqual(result.selectedTargets, ['cursor']);
    assert.equal(result.scannedTargets[0].id, 'cursor');
  });
});
