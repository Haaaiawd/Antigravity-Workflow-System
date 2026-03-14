'use strict';

const TARGETS = {
  windsurf: {
    id: 'windsurf',
    label: 'Windsurf',
    rootAgentFile: false,
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
    projections: {
      commands: '.cursor/commands'
    },
    detect: ['.cursor/commands']
  },
  claude: {
    id: 'claude',
    label: 'Claude',
    rootAgentFile: false,
    projections: {
      commands: '.claude/commands'
    },
    detect: ['.claude/commands']
  },
  copilot: {
    id: 'copilot',
    label: 'GitHub Copilot',
    rootAgentFile: false,
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
    throw new Error(`Unsupported target: ${targetId}`);
  }

  return target;
}

module.exports = {
  TARGETS,
  getTarget,
  listTargets
};
