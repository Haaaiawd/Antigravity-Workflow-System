'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const TARGETS = {
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    rootAgentFile: false,
    projectionTypes: {
      workflow: ['workflows'],
      skill: ['skills']
    },
    projections: {
      workflows: '.windsurf/workflows',
      skills: '.windsurf/skills'
    },
    detect: ['.windsurf/workflows', '.windsurf/skills']
  },
  antigravity: {
    id: 'antigravity',
    label: 'Antigravity',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['workflows'],
      skill: ['skills']
    },
    projections: {
      workflows: '.agents/workflows',
      skills: '.agents/skills'
    },
    detect: ['.agents/workflows', '.agents/skills']
  },
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    rootAgentFile: false,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['commands']
    },
    projections: {
      commands: '.cursor/commands'
    },
    detect: ['.cursor/commands']
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    rootAgentFile: false,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['commands']
    },
    projections: {
      commands: '.claude/commands'
    },
    detect: ['.claude/commands']
  },
  copilot: {
    id: 'copilot',
    label: 'GitHub Copilot',
    rootAgentFile: false,
    projectionTypes: {
      workflow: ['agents', 'prompts'],
      skill: ['prompts']
    },
    projections: {
      agents: '.github/agents',
      prompts: '.github/prompts'
    },
    detect: ['.github/agents', '.github/prompts']
  },
  codex: {
    id: 'codex',
    label: 'Codex',
    rootAgentFile: false,
    projectionTypes: {
      workflow: ['prompts'],
      skill: ['skills']
    },
    projections: {
      prompts: '.codex/prompts',
      skills: '.codex/skills'
    },
    detect: ['.codex/prompts', '.codex/skills']
  }
};

function listTargets() {
  return Object.values(TARGETS);
}

function getTarget(targetId) {
  if (!targetId) {
    throw new Error('targetId is required');
  }

  const target = TARGETS[targetId];
  if (!target) {
    throw new Error(`Unsupported target: ${targetId}. Supported targets: ${listTargets().map((item) => item.id).join(', ')}`);
  }

  return target;
}

async function pathExists(targetPath) {
  return fs.access(targetPath).then(() => true).catch(() => false);
}

async function detectInstalledTarget(cwd) {
  const targets = await detectInstalledTargets(cwd);
  return targets[0] || null;
}

async function detectInstalledTargets(cwd) {
  const installedTargets = [];

  for (const target of listTargets()) {
    for (const relPath of target.detect) {
      if (await pathExists(path.join(cwd, relPath))) {
        installedTargets.push(target);
        break;
      }
    }
  }

  return installedTargets;
}

module.exports = {
  TARGETS,
  detectInstalledTarget,
  detectInstalledTargets,
  getTarget,
  listTargets
};
