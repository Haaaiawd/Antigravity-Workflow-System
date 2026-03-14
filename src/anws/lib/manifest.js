'use strict';

const { getTarget } = require('./adapters');

/**
 * MANAGED_FILES — anws 托管文件清单
 *
 * 此数组列出 anws 包负责管理的所有文件路径（相对于目标项目根目录）。
 */
const RESOURCE_REGISTRY = [
  { id: 'blueprint', type: 'workflow', source: '.agents/workflows/blueprint.md', fileName: 'blueprint.md' },
  { id: 'challenge', type: 'workflow', source: '.agents/workflows/challenge.md', fileName: 'challenge.md' },
  { id: 'change', type: 'workflow', source: '.agents/workflows/change.md', fileName: 'change.md' },
  { id: 'craft', type: 'workflow', source: '.agents/workflows/craft.md', fileName: 'craft.md' },
  { id: 'design-system', type: 'workflow', source: '.agents/workflows/design-system.md', fileName: 'design-system.md' },
  { id: 'explore', type: 'workflow', source: '.agents/workflows/explore.md', fileName: 'explore.md' },
  { id: 'forge', type: 'workflow', source: '.agents/workflows/forge.md', fileName: 'forge.md' },
  { id: 'genesis', type: 'workflow', source: '.agents/workflows/genesis.md', fileName: 'genesis.md' },
  { id: 'probe', type: 'workflow', source: '.agents/workflows/probe.md', fileName: 'probe.md' },
  { id: 'quickstart', type: 'workflow', source: '.agents/workflows/quickstart.md', fileName: 'quickstart.md' },
  { id: 'upgrade', type: 'workflow', source: '.agents/workflows/upgrade.md', fileName: 'upgrade.md' },
  { id: 'concept-modeler', type: 'skill', source: '.agents/skills/concept-modeler/SKILL.md', fileName: 'concept-modeler/SKILL.md' },
  { id: 'design-reviewer', type: 'skill', source: '.agents/skills/design-reviewer/SKILL.md', fileName: 'design-reviewer/SKILL.md' },
  { id: 'nexus-mapper', type: 'skill', source: '.agents/skills/nexus-mapper/SKILL.md', fileName: 'nexus-mapper/SKILL.md' },
  { id: 'nexus-mapper-language-customization', type: 'skill', source: '.agents/skills/nexus-mapper/references/language-customization.md', fileName: 'nexus-mapper/references/language-customization.md' },
  { id: 'nexus-mapper-output-schema', type: 'skill', source: '.agents/skills/nexus-mapper/references/output-schema.md', fileName: 'nexus-mapper/references/output-schema.md' },
  { id: 'nexus-mapper-probe-protocol', type: 'skill', source: '.agents/skills/nexus-mapper/references/probe-protocol.md', fileName: 'nexus-mapper/references/probe-protocol.md' },
  { id: 'nexus-mapper-extract-ast', type: 'skill', source: '.agents/skills/nexus-mapper/scripts/extract_ast.py', fileName: 'nexus-mapper/scripts/extract_ast.py' },
  { id: 'nexus-mapper-git-detective', type: 'skill', source: '.agents/skills/nexus-mapper/scripts/git_detective.py', fileName: 'nexus-mapper/scripts/git_detective.py' },
  { id: 'nexus-mapper-languages', type: 'skill', source: '.agents/skills/nexus-mapper/scripts/languages.json', fileName: 'nexus-mapper/scripts/languages.json' },
  { id: 'nexus-mapper-query-graph', type: 'skill', source: '.agents/skills/nexus-mapper/scripts/query_graph.py', fileName: 'nexus-mapper/scripts/query_graph.py' },
  { id: 'nexus-mapper-requirements', type: 'skill', source: '.agents/skills/nexus-mapper/scripts/requirements.txt', fileName: 'nexus-mapper/scripts/requirements.txt' },
  { id: 'report-template', type: 'skill', source: '.agents/skills/report-template/SKILL.md', fileName: 'report-template/SKILL.md' },
  { id: 'report-template-reference', type: 'skill', source: '.agents/skills/report-template/references/REPORT_TEMPLATE.md', fileName: 'report-template/references/REPORT_TEMPLATE.md' },
  { id: 'runtime-inspector', type: 'skill', source: '.agents/skills/runtime-inspector/SKILL.md', fileName: 'runtime-inspector/SKILL.md' },
  { id: 'sequential-thinking', type: 'skill', source: '.agents/skills/sequential-thinking/SKILL.md', fileName: 'sequential-thinking/SKILL.md' },
  { id: 'spec-writer', type: 'skill', source: '.agents/skills/spec-writer/SKILL.md', fileName: 'spec-writer/SKILL.md' },
  { id: 'spec-writer-prd-template', type: 'skill', source: '.agents/skills/spec-writer/references/prd_template.md', fileName: 'spec-writer/references/prd_template.md' },
  { id: 'system-architect', type: 'skill', source: '.agents/skills/system-architect/SKILL.md', fileName: 'system-architect/SKILL.md' },
  { id: 'system-architect-rfc-template', type: 'skill', source: '.agents/skills/system-architect/references/rfc_template.md', fileName: 'system-architect/references/rfc_template.md' },
  { id: 'system-designer', type: 'skill', source: '.agents/skills/system-designer/SKILL.md', fileName: 'system-designer/SKILL.md' },
  { id: 'system-designer-detail-template', type: 'skill', source: '.agents/skills/system-designer/references/system-design-detail-template.md', fileName: 'system-designer/references/system-design-detail-template.md' },
  { id: 'system-designer-template', type: 'skill', source: '.agents/skills/system-designer/references/system-design-template.md', fileName: 'system-designer/references/system-design-template.md' },
  { id: 'task-planner', type: 'skill', source: '.agents/skills/task-planner/SKILL.md', fileName: 'task-planner/SKILL.md' },
  { id: 'task-planner-template', type: 'skill', source: '.agents/skills/task-planner/references/TASK_TEMPLATE.md', fileName: 'task-planner/references/TASK_TEMPLATE.md' },
  { id: 'task-reviewer', type: 'skill', source: '.agents/skills/task-reviewer/SKILL.md', fileName: 'task-reviewer/SKILL.md' },
  { id: 'tech-evaluator', type: 'skill', source: '.agents/skills/tech-evaluator/SKILL.md', fileName: 'tech-evaluator/SKILL.md' },
  { id: 'tech-evaluator-adr-template', type: 'skill', source: '.agents/skills/tech-evaluator/references/ADR_TEMPLATE.md', fileName: 'tech-evaluator/references/ADR_TEMPLATE.md' }
];

const TARGET_TYPE_TO_PROJECTION = {
  antigravity: {
    workflow: 'workflows',
    skill: 'skills'
  },
  windsurf: {
    workflow: 'workflows',
    skill: 'skills'
  },
  cursor: {
    workflow: 'commands',
    skill: 'commands'
  },
  claude: {
    workflow: 'commands',
    skill: 'commands'
  },
  copilot: {
    workflow: ['agents', 'prompts'],
    skill: ['prompts']
  },
  codex: {
    workflow: 'prompts',
    skill: 'skills'
  }
};

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function toProjectionFileName(resource, projectionType) {
  if (projectionType === 'commands' || projectionType === 'prompts' || projectionType === 'agents') {
    return `${resource.id}.md`;
  }
  return resource.fileName;
}

function buildProjectionEntries(targetId) {
  const target = getTarget(targetId);
  const typeMap = TARGET_TYPE_TO_PROJECTION[target.id];

  return RESOURCE_REGISTRY.flatMap((resource) => {
    const projectionTypes = typeMap[resource.type];
    if (!projectionTypes) {
      return [];
    }

    return toArray(projectionTypes).map((projectionType) => ({
      ...resource,
      projectionType,
      outputRoot: target.projections[projectionType],
      outputPath: `${target.projections[projectionType]}/${toProjectionFileName(resource, projectionType)}`
    }));
  });
}

function buildManagedFiles(targetId = 'antigravity') {
  const target = getTarget(targetId);
  const entries = buildProjectionEntries(target.id);
  const files = entries.map((item) => item.outputPath);

  if (target.rootAgentFile) {
    files.unshift('AGENTS.md');
  }

  return files;
}

function buildUserProtectedFiles(targetId = 'antigravity') {
  const target = getTarget(targetId);
  return target.rootAgentFile ? ['AGENTS.md'] : [];
}

function findByType(type) {
  return RESOURCE_REGISTRY.filter((item) => item.type === type);
}

const MANAGED_FILES = buildManagedFiles('antigravity');

/**
 * USER_PROTECTED_FILES — 用户保护文件
 *
 * 这些文件在项目初始化后通常会包含特定于项目的配置。
 * anws update 默认会跳过这些文件。
 */
const USER_PROTECTED_FILES = buildUserProtectedFiles('antigravity');

module.exports = {
  RESOURCE_REGISTRY,
  buildManagedFiles,
  buildProjectionEntries,
  buildUserProtectedFiles,
  findByType,
  MANAGED_FILES,
  USER_PROTECTED_FILES
};
