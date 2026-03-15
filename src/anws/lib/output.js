'use strict';

/**
 * lib/output.js — 统一终端输出工具
 *
 * 特性:
 * - ✔ / ⚠ / ✖ Unicode 前缀区分成功/警告/错误
 * - 自动 ANSI 颜色（TTY 环境）
 * - 非 TTY 或 NO_COLOR=1 时自动降级为无颜色输出
 * - 不依赖任何第三方库
 */

// ─── 颜色检测 ─────────────────────────────────────────────────────────────────
const useColor =
  !!process.stdout.isTTY &&
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb';

const PALETTE = {
  ink: [242, 244, 246],
  muted: [159, 166, 174],
  brand: [127, 181, 182],
  frost: [242, 244, 246],
  deep: [31, 34, 38],
};

// ─── ANSI 转义码 ──────────────────────────────────────────────────────────────
const c = {
  brand:  useColor ? '\x1b[38;2;127;181;182m' : '',
  ink:    useColor ? '\x1b[38;2;242;244;246m' : '',
  muted:  useColor ? '\x1b[38;2;159;166;174m' : '',
  deep:   useColor ? '\x1b[38;2;31;34;38m' : '',
  green:  useColor ? '\x1b[32m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  red:    useColor ? '\x1b[31m' : '',
  dim:    useColor ? '\x1b[2m'  : '',
  reset:  useColor ? '\x1b[0m'  : '',
};

function mixRgb(start, end, ratio) {
  return [
    Math.round(start[0] + (end[0] - start[0]) * ratio),
    Math.round(start[1] + (end[1] - start[1]) * ratio),
    Math.round(start[2] + (end[2] - start[2]) * ratio),
  ];
}

function colorRgb(rgb) {
  return useColor ? `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m` : '';
}

function colorize(text, tone) {
  if (!useColor || !tone) return text;
  const color = Array.isArray(tone) ? colorRgb(tone) : tone;
  return `${color}${text}${c.reset}`;
}

function visibleLength(text) {
  return String(text).replace(/\x1b\[[0-9;]*m/g, '').length;
}

function mixStops(stops, ratio) {
  if (stops.length === 0) return [255, 255, 255];
  if (stops.length === 1) return stops[0];

  const clamped = Math.max(0, Math.min(1, ratio));
  const scaled = clamped * (stops.length - 1);
  const leftIndex = Math.floor(scaled);
  const rightIndex = Math.min(stops.length - 1, leftIndex + 1);
  const localRatio = scaled - leftIndex;
  return mixRgb(stops[leftIndex], stops[rightIndex], localRatio);
}

function stylizeAsciiLine(text, rowIndex, rowCount) {
  if (!useColor) return text;

  const rowRatio = rowCount <= 1 ? 0 : rowIndex / (rowCount - 1);
  const softenedTop = Math.pow(rowRatio, 1.12);
  const rowBase = mixStops(
    [PALETTE.deep, PALETTE.brand, PALETTE.muted, PALETTE.ink],
    0.08 + softenedTop * 0.8
  );
  const center = text.length / 2;

  let output = '';
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === ' ') {
      output += char;
      continue;
    }

    const distance = Math.abs(index - center) / Math.max(1, center);
    const highlight = Math.max(0, 1 - distance);
    const horizontalRatio = text.length <= 1 ? 0 : index / (text.length - 1);
    const sweep = mixStops(
      [PALETTE.deep, PALETTE.brand, PALETTE.frost, PALETTE.muted, PALETTE.ink],
      horizontalRatio
    );
    const brandLift = mixRgb(rowBase, PALETTE.brand, 0.14 + highlight * 0.16);
    const cooled = mixRgb(brandLift, sweep, 0.4 + highlight * 0.18);
    const lowerGlow = Math.max(0, rowRatio - 0.58) / 0.42;
    const tone = mixRgb(cooled, PALETTE.ink, 0.02 + highlight * 0.16 + lowerGlow * 0.16);
    output += `${colorRgb(tone)}${char}`;
  }

  return output + c.reset;
}

function centerLine(text, width) {
  const length = visibleLength(text);
  if (!width || length >= width) return text;
  const leftPad = Math.max(0, Math.floor((width - length) / 2));
  return `${' '.repeat(leftPad)}${text}`;
}

function stylizeTagline(text) {
  if (!useColor) return text;

  let output = '';
  const length = text.length;
  for (let index = 0; index < length; index += 1) {
    const char = text[index];
    if (char === ' ') {
      output += char;
      continue;
    }

    const ratio = length <= 1 ? 0 : index / (length - 1);
    const wave = Math.abs(ratio - 0.5) * 2;
    const base = mixStops(
      [PALETTE.deep, PALETTE.brand, PALETTE.muted, PALETTE.ink],
      ratio
    );
    const tone = mixRgb(base, PALETTE.ink, 0.08 + (1 - wave) * 0.18);
    output += `${colorRgb(tone)}${char}`;
  }

  return output + c.reset;
}

function padText(text, width) {
  const padding = Math.max(0, width - visibleLength(text));
  return `${text}${' '.repeat(padding)}`;
}

function drawBox(options = {}) {
  const title = options.title || '';
  const lines = Array.isArray(options.lines) ? options.lines : [];
  const accent = options.accent || PALETTE.brand;
  const borderTone = options.borderTone || PALETTE.muted;
  const textTone = options.textTone || c.ink;
  const minWidth = Number.isInteger(options.minWidth) ? options.minWidth : 20;
  const innerWidth = Math.max(minWidth, visibleLength(title), ...lines.map((line) => visibleLength(line)));
  const titleText = title ? ` ${title} ` : '';
  const top = `╭${titleText}${'─'.repeat(Math.max(0, innerWidth + 2 - visibleLength(titleText)))}╮`;
  const bottom = `╰${'─'.repeat(innerWidth + 2)}╯`;
  const body = lines.map((line) => {
    // 支持分隔线：以 '---' 开头的行渲染为水平分隔线
    if (line.startsWith('---')) {
      const sepInner = '─'.repeat(innerWidth);
      return `${colorize('│', borderTone)}${colorize(sepInner, borderTone)}${colorize('│', borderTone)}`;
    }
    const padded = padText(line, innerWidth);
    return `${colorize('│', borderTone)} ${colorize(padded, textTone)} ${colorize('│', borderTone)}`;
  });

  return [
    colorize(top, accent),
    ...body,
    colorize(bottom, borderTone)
  ].join('\n');
}

function section(title, lines = [], options = {}) {
  console.log(drawBox({
    title,
    lines,
    accent: options.accent || PALETTE.brand,
    borderTone: options.borderTone || PALETTE.muted,
    textTone: options.textTone || c.ink,
    minWidth: options.minWidth
  }));
}
// ─── 公共输出函数 ─────────────────────────────────────────────────────────────

/** 成功消息（绿色 ✔）*/
function success(msg) {
  console.log(`${c.green}\u2714${c.reset} ${msg}`);
}

/** 警告/提示消息（黄色 ⚠）*/
function warn(msg) {
  console.log(`${c.yellow}\u26a0${c.reset}  ${msg}`);
}

/** 错误消息（红色 ✖，写入 stderr）*/
function error(msg) {
  console.error(`${c.red}\u2716${c.reset} ${msg}`);
}

/** 普通信息行（缩进两格）*/
function info(msg) {
  console.log(`  ${msg}`);
}

/** 文件路径行（dimmed 样式）*/
function fileLine(relativePath) {
  console.log(`  ${c.dim}${relativePath}${c.reset}`);
}

/** 跳过行（黄色 dim，带 ~ 前缀表示未修改）*/
function skippedLine(relativePath) {
  console.log(`  ${c.yellow}~ ${relativePath}${c.reset}${c.dim} (skipped)${c.reset}`);
}

/** 空行 */
function blank() {
  console.log('');
}

/** 打印 ASCII Logo */
function logo() {
  const terminalWidth = Number.isInteger(process.stdout.columns) ? process.stdout.columns : 0;
  const art = [
    '█████╗ ███╗   ██╗██╗    ██╗███████╗',
    '██╔══██╗████╗  ██║██║    ██║██╔════╝',
    '███████║██╔██╗ ██║██║ █╗ ██║███████╗',
    '██╔══██║██║╚██╗██║██║███╗██║╚════██║',
    '██║  ██║██║ ╚████║╚███╔███╔╝███████║',
    '╚═╝  ╚═╝╚═╝  ╚═══╝ ╚══╝╚══╝ ╚══════╝',
  ];
  const title = art
    .map((line, index, lines) => {
      const centered = centerLine(line, terminalWidth);
      return useColor ? stylizeAsciiLine(centered, index, lines.length) : centered;
    })
    .join('\n');
  const taglineText = centerLine('‹ Axiom · Nexus · Weave · Sovereignty ›', terminalWidth);
  const tagline = useColor ? stylizeTagline(taglineText) : taglineText;

  console.log(title);
  console.log(tagline);
}

module.exports = { success, warn, error, info, fileLine, skippedLine, blank, logo, c, PALETTE, colorRgb, colorize, visibleLength, drawBox, section };





