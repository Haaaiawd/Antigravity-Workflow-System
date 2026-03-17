# .anws v7 - 版本清单

**创建日期**: 2026-03-17
**状态**: Active
**前序版本**: v6 (2026-03-15)

## 版本目标

在 v6 已建立“多 AI IDE 多目标安装 + install-lock + 统一 update”基础上，v7 进一步将系统真理从“文档中的理想矩阵”对齐到“当前实现 + 明确扩展计划”的现实矩阵：

- 以当前实现为准，正式确认 `GitHub Copilot = prompts + skills`
- 以当前实现为准，正式确认 `Codex = skills-only`，并将 workflow 折叠进技能包
- 新增 `Trae`、`Qoder`、`Kilo Code` 三个目标工具的正式支持规划
- 明确 `update` 的扫描目录、sentinel 与 `.anws/install-lock.json` 的状态语义
- 明确 `AGENTS.md` 在 `init` / `update` 中必须保留 AUTO 区块，不得发生整文件覆盖

## 主要变更

- 修正文档中 Copilot / Codex 的目标矩阵，使其与当前实现一致
- 扩展首批支持矩阵到 `Windsurf`、`Antigravity`、`Cursor`、`Claude`、`GitHub Copilot`、`Codex`、`OpenCode`、`Trae`、`Qoder`、`Kilo Code`
- 为 `Trae` 定义 skills-only 适配方向，并保留其 YAML frontmatter / 触发语义差异
- 为 `Qoder` 定义 `.qoder/commands/` + `.qoder/skills/` 目标布局
- 为 `Kilo Code` 定义 `.kilocode/workflows/` + `.kilocode/skills/` 目标布局
- 将 `AGENTS.md` 整体覆盖导致 AUTO 区块丢失的问题，升级为显式架构缺陷与实施任务

## 文档清单

- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [ ] 03_ADR/ (待补充 v7 决策记录)
- [ ] 04_SYSTEM_DESIGN/ (待 /design-system 执行)
- [x] 05_TASKS.md
- [x] 06_CHANGELOG.md
