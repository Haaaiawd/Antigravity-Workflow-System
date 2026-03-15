'use strict';

const { blank, PALETTE, c, colorize, drawBox, visibleLength } = require('./output');

const KEY = {
  CTRL_C: '\u0003',
  ENTER: '\r',
  NEWLINE: '\n',
  SPACE: ' ',
  ESCAPE: '\u001b',
  ARROW_UP: '\u001b[A',
  ARROW_DOWN: '\u001b[B',
  ARROW_RIGHT: '\u001b[C',
  ARROW_LEFT: '\u001b[D'
};

async function selectMultiple({ message, options, initialSelectedIndexes = [] }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return initialSelectedIndexes.map((index) => options[index]).filter(Boolean);
  }

  const selected = new Set(initialSelectedIndexes.filter((index) => index >= 0 && index < options.length));
  const state = {
    cursorIndex: 0,
    errorMessage: ''
  };

  blank();

  return runPrompt({
    render() {
      return renderMultiSelect({ message, options, selected, cursorIndex: state.cursorIndex, errorMessage: state.errorMessage });
    },
    onKey(key) {
      if (key === KEY.CTRL_C) {
        return 'abort';
      }

      if (key === KEY.ARROW_UP) {
        state.cursorIndex = (state.cursorIndex - 1 + options.length) % options.length;
        state.errorMessage = '';
        return 'render';
      }

      if (key === KEY.ARROW_DOWN) {
        state.cursorIndex = (state.cursorIndex + 1) % options.length;
        state.errorMessage = '';
        return 'render';
      }

      if (key === KEY.SPACE) {
        if (selected.has(state.cursorIndex)) {
          selected.delete(state.cursorIndex);
        } else {
          selected.add(state.cursorIndex);
        }
        state.errorMessage = '';
        return 'render';
      }

      if (key === KEY.ENTER || key === KEY.NEWLINE) {
        if (selected.size === 0) {
          state.errorMessage = 'Select at least one target before continuing.';
          return 'render';
        }
        return Array.from(selected).sort((left, right) => left - right).map((index) => options[index]);
      }

      return null;
    }
  });
}

async function confirm({ message, messageLines = [], contextLines = [], confirmLabel = 'Continue', cancelLabel = 'Cancel', defaultValue = false }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return defaultValue;
  }

  const state = { value: defaultValue ? 'confirm' : 'cancel' };
  blank();

  return runPrompt({
    render() {
      return renderConfirm({ message, messageLines, contextLines, confirmLabel, cancelLabel, value: state.value });
    },
    onKey(key) {
      if (key === KEY.CTRL_C) {
        return 'abort';
      }

      if (key === KEY.ARROW_LEFT || key === KEY.ARROW_UP) {
        state.value = 'confirm';
        return 'render';
      }

      if (key === KEY.ARROW_RIGHT || key === KEY.ARROW_DOWN) {
        state.value = 'cancel';
        return 'render';
      }

      if (key === 'y' || key === 'Y') {
        return true;
      }

      if (key === 'n' || key === 'N') {
        return false;
      }

      if (key === KEY.ENTER || key === KEY.NEWLINE) {
        return state.value === 'confirm';
      }

      return null;
    }
  });
}

function renderMultiSelect({ message, options, selected, cursorIndex, errorMessage = '' }) {
  const optionLines = options.map((option, index) => {
    const isActive = index === cursorIndex;
    const isSelected = selected.has(index);
    const cursor = isActive ? colorize('❯', PALETTE.brand) : ' ';
    const mark = isSelected ? colorize('◉', PALETTE.brand) : colorize('◌', PALETTE.muted);
    const label = isActive ? colorize(option.label, PALETTE.ink) : option.label;
    return `${cursor} ${mark} ${label}`;
  });

  return centerFrame([
    drawBox({
      title: 'Select Targets',
      lines: [
        message,
        '',
        ...optionLines,
        '',
        errorMessage ? colorize(errorMessage, c.yellow) : colorize('Choose any set of targets, then press Enter.', PALETTE.muted)
      ],
      accent: PALETTE.brand,
      borderTone: PALETTE.muted,
      minWidth: 60
    }),
    colorize('  ↑/↓ Move   Space Toggle   Enter Confirm', PALETTE.muted)
  ].join('\n'));
}

function renderConfirm({ message, messageLines = [], contextLines = [], confirmLabel, cancelLabel, value }) {
  const confirmOption = renderChoiceChip(confirmLabel, value === 'confirm');
  const cancelOption = renderChoiceChip(cancelLabel, value === 'cancel');
  const contentLines = messageLines.length > 0 ? messageLines : [message];

  // 构建框内行：如果有 contextLines，则在上半部分显示，用分隔线隔开
  const boxLines = contextLines.length > 0
    ? [...contextLines, '---', ...contentLines, '', `${confirmOption}    ${cancelOption}`]
    : [...contentLines, '', `${confirmOption}    ${cancelOption}`];

  return centerFrame([
    drawBox({
      title: 'Confirm',
      lines: boxLines,
      accent: PALETTE.brand,
      borderTone: PALETTE.muted,
      minWidth: 60
    }),
    colorize('  ←/→ Choose   Enter Confirm', PALETTE.muted)
  ].join('\n'));
}

function runPrompt({ render, onKey }) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  let previousLineCount = 0;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', handleData);
    };

    const finish = (value) => {
      clearFrame(previousLineCount);
      cleanup();
      resolve(value);
    };

    const fail = (error) => {
      clearFrame(previousLineCount);
      cleanup();
      reject(error);
    };

    const rerender = () => {
      const frame = render();
      const lineCount = frame.split('\n').length;

      if (previousLineCount > 0) {
        stdout.write(`\x1b[${previousLineCount}F`);
      }

      stdout.write(`${frame}\n`);

      if (previousLineCount > lineCount) {
        for (let index = 0; index < previousLineCount - lineCount; index += 1) {
          stdout.write('\x1b[2K\n');
        }
        stdout.write(`\x1b[${previousLineCount - lineCount}F`);
      }

      previousLineCount = lineCount;
    };

    const handleData = (buffer) => {
      const key = buffer.toString('utf8');
      const result = onKey(key);

      if (result === 'abort') {
        fail(new Error('Prompt aborted by user'));
        return;
      }

      if (result === 'render') {
        rerender();
        return;
      }

      if (result !== null && result !== undefined) {
        finish(result);
      }
    };

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', handleData);
    rerender();
  });
}

function clearFrame(lineCount) {
  if (!process.stdout.isTTY || lineCount <= 0) {
    return;
  }

  process.stdout.write(`\x1b[${lineCount}F`);
  for (let index = 0; index < lineCount; index += 1) {
    process.stdout.write('\x1b[2K');
    if (index < lineCount - 1) {
      process.stdout.write('\n');
    }
  }
  process.stdout.write('\r');
}

function renderChoiceChip(label, isActive) {
  const prefix = isActive ? '■' : '□';
  const text = `${prefix} ${label}`;
  const width = Math.max(12, visibleLength(label) + 4);
  const padded = `${text}${' '.repeat(Math.max(0, width - visibleLength(text)))}`;
  return isActive ? colorize(padded, PALETTE.brand) : colorize(padded, PALETTE.muted);
}

function centerFrame(frame) {
  const terminalWidth = Number.isInteger(process.stdout.columns) ? process.stdout.columns : 0;
  if (!terminalWidth) {
    return frame;
  }

  return frame
    .split('\n')
    .map((line) => {
      const padding = Math.max(0, Math.floor((terminalWidth - visibleLength(line)) / 2));
      return `${' '.repeat(padding)}${line}`;
    })
    .join('\n');
}

module.exports = {
  selectMultiple,
  confirm,
  renderMultiSelect,
  renderConfirm
};


