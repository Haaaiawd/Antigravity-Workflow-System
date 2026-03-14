'use strict';

const path = require('node:path');
const { findByType } = require('../manifest');

const TEMPLATE_ROOT = path.join(__dirname, '..', '..', 'templates');
const AGENTS_ROOT = path.join(TEMPLATE_ROOT, '.agents');
const ROOT_AGENTS_FILE = path.join(TEMPLATE_ROOT, 'AGENTS.md');

function listCanonicalResources() {
  return [
    ...findByType('workflow').map((item) => ({ ...item })),
    ...findByType('skill').map((item) => ({ ...item }))
  ];
}

function resolveCanonicalSource(relPath) {
  return path.join(TEMPLATE_ROOT, relPath);
}

module.exports = {
  TEMPLATE_ROOT,
  AGENTS_ROOT,
  ROOT_AGENTS_FILE,
  listCanonicalResources,
  resolveCanonicalSource
};
