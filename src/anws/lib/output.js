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

// ─── ANSI 转义码 ──────────────────────────────────────────────────────────────
const c = {
  green:  useColor ? '\x1b[32m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  red:    useColor ? '\x1b[31m' : '',
  dim:    useColor ? '\x1b[2m'  : '',
  reset:  useColor ? '\x1b[0m'  : '',
};

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

/** 空行 */
function blank() {
  console.log('');
}

module.exports = { success, warn, error, info, fileLine, blank, c };
