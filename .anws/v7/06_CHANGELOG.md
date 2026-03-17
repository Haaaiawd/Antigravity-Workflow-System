# 变更日志 - .anws v7

> 此文件记录 v7 文档建立与后续微调。v7 由 /genesis 创建，用于承接目标矩阵真理修正与新 target 扩展。

## 2026-03-17 - v7 初始化

- [ADD] 创建 `.anws/v7`，以当前实现为主重建目标矩阵真理
- [ADD] 正式将 `GitHub Copilot` 定义为 `prompts + skills`
- [ADD] 正式将 `Codex` 定义为 `skills-only bundle`，workflow 折叠进 `anws-system` 技能包
- [ADD] 正式将 `OpenCode` 纳入目标矩阵
- [ADD] 新增 `Trae` 适配方向：`.trae/skills/`，工作流折叠进 skill bundle，并保留 YAML frontmatter / triggers 语义
- [ADD] 新增 `Qoder` 适配方向：`.qoder/commands/` + `.qoder/skills/`
- [ADD] 新增 `Kilo Code` 适配方向：`.kilocode/workflows/` + `.kilocode/skills/`
- [ADD] 正式记录 `update` 的 sentinel 扫描模型与 `.anws/install-lock.json` 状态优先语义
- [ADD] 将 `init` 可能整体覆盖根目录 `AGENTS.md` 并导致 AUTO 区块丢失的问题升级为显式缺陷与任务

## 研究来源

- `d:\PROJECTALL\Workflow\note.txt`
- 当前实现：`src/anws/lib/adapters/index.js`
- 当前实现：`src/anws/lib/manifest.js`
- 当前实现：`src/anws/lib/init.js`
- 当前实现：`src/anws/lib/update.js`
- 当前实现：`src/anws/lib/agents.js`
- 当前实现：`src/anws/lib/install-state.js`
