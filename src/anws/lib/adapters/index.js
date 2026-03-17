'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const TARGETS = {
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['workflows'],
      skill: ['skills']
    },
    projections: {
      workflows: '.windsurf/workflows',
      skills: '.windsurf/skills'
    },
    detect: ['.windsurf/workflows/genesis.md']
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
    detect: ['.agents/workflows/genesis.md', '.agent/workflows/genesis.md']
  },
  cursor: {
    id: 'cursor',
    label: 'Cursor',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['skills']
    },
    projections: {
      commands: '.cursor/commands',
      skills: '.cursor/skills'
    },
    detect: ['.cursor/commands/genesis.md']
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['skills']
    },
    projections: {
      commands: '.claude/commands',
      skills: '.claude/skills'
    },
    detect: ['.claude/commands/genesis.md']
  },
  copilot: {
    id: 'copilot',
    label: 'GitHub Copilot',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['prompts'],
      skill: ['skills']
    },
    projections: {
      prompts: '.github/prompts',
      skills: '.github/skills'
    },
    detect: ['.github/prompts/genesis.prompt.md']
  },
  codex: {
    id: 'codex',
    label: 'Codex (Preview)',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['skills'],
      skill: ['skills']
    },
    projections: {
      skills: '.codex/skills'
    },
    detect: ['.codex/skills/anws-system/SKILL.md']
  },
  trae: {
    id: 'trae',
    label: 'Trae',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['skills'],
      skill: ['skills']
    },
    projections: {
      skills: '.trae/skills'
    },
    detect: ['.trae/skills/anws-system/SKILL.md']
  },
  qoder: {
    id: 'qoder',
    label: 'Qoder',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['skills']
    },
    projections: {
      commands: '.qoder/commands',
      skills: '.qoder/skills'
    },
    detect: ['.qoder/commands/genesis.md']
  },
  kilo: {
    id: 'kilo',
    label: 'Kilo Code',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['workflows'],
      skill: ['skills']
    },
    projections: {
      workflows: '.kilocode/workflows',
      skills: '.kilocode/skills'
    },
    detect: ['.kilocode/workflows/genesis.md']
  },
  opencode: {
    id: 'opencode',
    label: 'OpenCode',
    rootAgentFile: true,
    projectionTypes: {
      workflow: ['commands'],
      skill: ['skills']
    },
    projections: {
      commands: '.opencode/commands',
      skills: '.opencode/skills'
    },
    detect: ['.opencode/commands/genesis.md']
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




