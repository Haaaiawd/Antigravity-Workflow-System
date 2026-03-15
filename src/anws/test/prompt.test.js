'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { renderMultiSelect, renderConfirm } = require('../lib/prompt');

test('renderMultiSelect shows cursor and multi-selection markers', () => {
  const frame = renderMultiSelect({
    message: 'Choose targets',
    options: [
      { label: 'Windsurf', value: 'windsurf' },
      { label: 'Codex (Preview)', value: 'codex' }
    ],
    selected: new Set([0]),
    cursorIndex: 1
  });

  assert.match(frame, /Choose targets/);
  assert.match(frame, /Select Targets/);
  assert.match(frame, /╭/);
  assert.match(frame, /╰/);
  assert.match(frame, /◉ Windsurf/);
  assert.match(frame, /❯ ◌ Codex \(Preview\)/);
  assert.match(frame, /Space Toggle/);
  assert.match(frame, /Choose any set of targets, then press Enter/);
});

test('renderMultiSelect shows inline validation when nothing is selected', () => {
  const frame = renderMultiSelect({
    message: 'Choose targets',
    options: [
      { label: 'Windsurf', value: 'windsurf' }
    ],
    selected: new Set(),
    cursorIndex: 0,
    errorMessage: 'Select at least one target before continuing.'
  });

  assert.match(frame, /Select at least one target before continuing/);
});

test('renderConfirm highlights the active option', () => {
  const confirmFrame = renderConfirm({
    message: 'Continue update?',
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    value: 'confirm'
  });
  const cancelFrame = renderConfirm({
    message: 'Continue update?',
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    value: 'cancel'
  });

  assert.match(confirmFrame, /Confirm/);
  assert.match(confirmFrame, /■ Continue/);
  assert.match(confirmFrame, /□ Cancel/);
  assert.match(cancelFrame, /□ Continue/);
  assert.match(cancelFrame, /■ Cancel/);
});

test('renderConfirm can render multi-line confirmation context', () => {
  const frame = renderConfirm({
    messageLines: [
      'Target selection',
      'Matched targets: Antigravity (antigravity)',
      'State source: directory scan fallback',
      '',
      'This will overwrite all managed files for: Antigravity.'
    ],
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    value: 'cancel'
  });

  assert.match(frame, /Target selection/);
  assert.match(frame, /Matched targets: Antigravity \(antigravity\)/);
  assert.match(frame, /This will overwrite all managed files for: Antigravity\./);
});
