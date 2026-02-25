#!/usr/bin/env node
'use strict';

const { parseArgs } = require('node:util');
const path = require('node:path');
const { error, info } = require('../lib/output');

// ─── 版本号从 package.json 读取 ─────────────────────────────────────────────
const { version } = require(path.join(__dirname, '..', 'package.json'));

// ─── 帮助文本 ─────────────────────────────────────────────────────────────────
const HELP = `
anws v${version} — Antigravity Workflow System CLI

USAGE
  anws <command> [options]

COMMANDS
  init      Copy .agent/ workflow system into the current project
  update    Update managed .agent/ files to the latest version

OPTIONS
  -v, --version   Print version number
  -h, --help      Show this help message

EXAMPLES
  anws init          # Set up workflow system in current directory
  anws update        # Update existing workflow files to latest
`.trimStart();

// ─── 参数解析 ─────────────────────────────────────────────────────────────────
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    version: { type: 'boolean', short: 'v', default: false },
    help:    { type: 'boolean', short: 'h', default: false },
  },
  strict: false,
  allowPositionals: true,
});

// ─── 命令路由 ─────────────────────────────────────────────────────────────────
async function main() {
  if (values.version) {
    console.log(version);
    process.exit(0);
  }

  if (values.help || positionals.length === 0) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const command = positionals[0];

  switch (command) {
    case 'init':
      await require('../lib/init')();
      break;

    case 'update':
      await require('../lib/update')();
      break;

    default:
      error(`Unknown command: "${command}"`);
      info('Run `anws --help` to see available commands.');
      process.exit(1);
  }
}

main().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
