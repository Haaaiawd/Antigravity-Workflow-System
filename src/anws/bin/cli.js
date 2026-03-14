#!/usr/bin/env node
'use strict';

const { parseArgs } = require('node:util');
const path = require('node:path');
const { blank, error, info, logo } = require('../lib/output');

// ─── 版本号从 package.json 读取 ─────────────────────────────────────────────
const { version } = require(path.join(__dirname, '..', 'package.json'));

// ─── 帮助文本 ─────────────────────────────────────────────────────────────────
const HELP = `
USAGE
  anws <command> [options]

COMMANDS
  init      Choose a target AI IDE and install its managed workflow projection
  update    Update the managed files for the currently installed target IDE

OPTIONS
  -v, --version   Print version number
  -h, --help      Show this help message
  --check         Preview update diff without writing files

EXAMPLES
  anws init          # Choose a target IDE and set up its workflow system
  anws update        # Update the currently installed target projection
  anws update --check
`.trimStart();

// ─── 参数解析 ─────────────────────────────────────────────────────────────────
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    version: { type: 'boolean', short: 'v', default: false },
    help:    { type: 'boolean', short: 'h', default: false },
    yes:     { type: 'boolean', short: 'y', default: false },
    check:   { type: 'boolean', default: false },
  },
  strict: false,
  allowPositionals: true,
});

if (values.yes) {
  global.__ANWS_FORCE_YES = true;
}

// ─── 命令路由 ─────────────────────────────────────────────────────────────────
async function main() {
  if (values.version) {
    console.log(version);
    process.exit(0);
  }

  if (values.help || positionals.length === 0) {
    logo();
    blank();
    console.log(HELP.trimEnd());
    process.exit(0);
  }

  const command = positionals[0];

  switch (command) {
    case 'init':
      await require('../lib/init')();
      break;

    case 'update':
      await require('../lib/update')({ check: values.check });
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
