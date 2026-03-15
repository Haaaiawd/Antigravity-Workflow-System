'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { warn, blank } = require('./output');
const AUTO_BEGIN_RE = /<!-- AUTO:BEGIN[\s\S]*?-->/;
const AUTO_END_RE = /<!-- AUTO:END -->/;
const LEGACY_HEADINGS = [
  '## 📍 当前状态',
  '## 🌳 项目结构',
  '## 🧭 导航指南'
];

async function pathExists(targetPath) {
  return fs.access(targetPath).then(() => true).catch(() => false);
}

async function getAgentsState(cwd) {
  const legacyPath = path.join(cwd, '.agent', 'rules', 'agents.md');
  const rootPath = path.join(cwd, 'AGENTS.md');

  return {
    legacyPath,
    rootPath,
    legacyExists: await pathExists(legacyPath),
    rootExists: await pathExists(rootPath)
  };
}

async function resolveAgentsInstall({ cwd, askMigrate, forceYes = false }) {
  const state = await getAgentsState(cwd);

  if (!state.legacyExists) {
    return { ...state, shouldWriteRootAgents: true, shouldWarnMigration: false };
  }

  const migrate = forceYes ? true : await askMigrate();
  return {
    ...state,
    shouldWriteRootAgents: migrate,
    shouldWarnMigration: migrate
  };
}

function getAutoBlockRange(content) {
  const beginMatch = content.match(AUTO_BEGIN_RE);
  const endMatch = content.match(AUTO_END_RE);

  if (!beginMatch || !endMatch) return null;

  const beginIndex = beginMatch.index;
  const endIndex = endMatch.index;
  const beginEnd = beginIndex + beginMatch[0].length;
  const endEnd = endIndex + endMatch[0].length;

  if (beginIndex > endIndex) return null;

  return {
    beginIndex,
    beginEnd,
    endIndex,
    endEnd
  };
}

function hasAutoBlock(content) {
  return getAutoBlockRange(content) !== null;
}

function isRecognizedLegacyAgents(content) {
  // 检查主标题
  if (!content.includes('# AGENTS.md - AI 协作协议')) return false;
  
  // 检查三个核心 section 标题（允许标题后包含额外文字）
  return LEGACY_HEADINGS.every((heading) => content.includes(heading));
}

function extractSection(content, heading) {
  const headingIndex = content.indexOf(heading);
  if (headingIndex === -1) return null;

  const afterHeading = content.slice(headingIndex + heading.length);
  const sectionBreaks = [];
  const nextRule = afterHeading.indexOf('\n---');
  const nextHeading = afterHeading.indexOf('\n## ');
  if (nextRule !== -1) sectionBreaks.push(nextRule);
  if (nextHeading !== -1) sectionBreaks.push(nextHeading);

  const relativeEnd = sectionBreaks.length > 0
    ? Math.min(...sectionBreaks)
    : afterHeading.length;

  return content.slice(headingIndex, headingIndex + heading.length + relativeEnd).trimEnd();
}

function replaceSection(content, heading, replacement) {
  const current = extractSection(content, heading);
  if (!current) return content;
  return content.replace(current, replacement);
}

function migrateLegacyAgentsContent({ templateContent, existingContent }) {
  const templateRange = getAutoBlockRange(templateContent);
  if (!templateRange) {
    return {
      mode: 'replace',
      content: templateContent
    };
  }

  let autoBody = templateContent.slice(templateRange.beginEnd, templateRange.endIndex);
  for (const heading of LEGACY_HEADINGS) {
    const legacySection = extractSection(existingContent, heading);
    if (legacySection) {
      autoBody = replaceSection(autoBody, heading, legacySection);
    }
  }

  return {
    mode: 'migrate',
    content: `${templateContent.slice(0, templateRange.beginEnd)}${autoBody}${templateContent.slice(templateRange.endIndex)}`
  };
}

function mergeAgentsContent({ templateContent, existingContent }) {
  const templateRange = getAutoBlockRange(templateContent);
  const existingRange = getAutoBlockRange(existingContent);

  if (!templateRange || !existingRange) {
    return {
      mode: 'replace',
      content: templateContent
    };
  }

  const templatePrefix = templateContent.slice(0, templateRange.beginEnd);
  const templateSuffix = templateContent.slice(templateRange.endIndex);
  const existingMiddle = existingContent.slice(existingRange.beginEnd, existingRange.endIndex);

  return {
    mode: 'merge',
    content: `${templatePrefix}${existingMiddle}${templateSuffix}`
  };
}

function planAgentsUpdate({ templateContent, existingContent }) {
  if (!existingContent) {
    return {
      mode: 'replace',
      content: templateContent
    };
  }

  if (hasAutoBlock(existingContent)) {
    return mergeAgentsContent({ templateContent, existingContent });
  }

  if (isRecognizedLegacyAgents(existingContent)) {
    return migrateLegacyAgentsContent({ templateContent, existingContent });
  }

  return {
    mode: 'skip',
    content: existingContent,
    warning: 'Root AGENTS.md does not contain AUTO markers and does not match a recognized legacy template. anws update will preserve it unchanged. Please migrate it manually or re-run after adding markers.'
  };
}

function printLegacyMigrationWarning() {
  blank();
  warn('Please manually copy your custom rules from .agent/rules/agents.md to the root AGENTS.md');
  warn('After copying, you can safely delete the old .agent/rules/agents.md file.');
  blank();
}

module.exports = {
  getAgentsState,
  hasAutoBlock,
  isRecognizedLegacyAgents,
  mergeAgentsContent,
  planAgentsUpdate,
  resolveAgentsInstall,
  printLegacyMigrationWarning,
  pathExists
};
