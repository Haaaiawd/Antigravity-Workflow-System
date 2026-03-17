# Product Requirements Document (PRD) v7.0

**Project**: Anws CLI
**Title**: `anws` — 面向多 AI IDE 的统一资源投影与多目标升级系统
**Status**: Draft
**Version**: 7.0
**Author**: Genesis Agent
**Date**: 2026-03-17
**前序版本**: v6.0 (2026-03-15)

---

## 1. Executive Summary

v6 已经将 `anws` 从单目标安装演进为多目标安装与统一 update 分发器，但在目标矩阵真理上出现了明显分叉：文档中的 Copilot / Codex 投影模型与实际 CLI、adapter registry、manifest、tests 已不一致，导致 `update` 行为可运行但不可解释。同时，产品范围已明确需要继续扩展 `Trae`、`Qoder`、`Kilo Code` 三个目标工具，并正式把扫描目录、sentinel、install-lock 和根目录 `AGENTS.md` 的保留语义写清楚。

v7 的核心目标是：**以当前实现为主重建单一真理，并为新增 targets 提供可实现、可测试、可解释的正式矩阵。**

---

## 2. Background & Context

### 2.1 Problem Statement

- v6 文档仍把 `GitHub Copilot` 描述为 `agent + prompt`，但当前实现已经演进为 `prompts + skills`
- v6 文档仍把 `Codex` 描述为 `prompt + skill`，但当前实现已经演进为 `skills-only`，workflow 被折叠进 `anws-system` 技能包
- `OpenCode` 已存在于实现和测试中，但尚未被 v6 正式纳入目标矩阵
- `Trae`、`Qoder`、`Kilo Code` 已被明确提出为下一批适配目标，但目前缺乏正式产品文档真理
- 根目录 `AGENTS.md` 在 `update` 中有 AUTO 区块合并逻辑，但 `init` 当前仍可能整文件覆盖，导致用户仓库已有的 AUTO 区块消失

### 2.2 Opportunity

将 `anws` 正式定义为“**共享 canonical resource + target-specific projection + explicit install state + explainable target matrix**”的 CLI 产品，使新增 target 不再通过隐式例外逻辑扩散，而通过统一矩阵和任务边界落地。

---

## 3. Goals & Non-Goals

### 3.1 Goals

- **[G1]**: `anws init` 支持在同一项目中显式选择多个目标 AI IDE 并一次性完成安装
- **[G2]**: `anws` 内部继续坚持独立于目标目录的 canonical resource model
- **[G3]**: v7 正式支持的目标矩阵为 `Windsurf`、`Antigravity`、`Cursor`、`Claude`、`GitHub Copilot`、`Codex`、`OpenCode`、`Trae`、`Qoder`、`Kilo Code`
- **[G4]**: 统一源资产必须可以投影为 `workflow / skill / prompt / command` 等目标资源形态，并允许某些工具把 workflow 投影为 `skill router + references` 结构
- **[G5]**: `anws update` 必须扫描项目中所有已安装 targets，展示扫描结果后统一更新全部命中的受管投影
- **[G6]**: `.anws/install-lock.json` 必须作为已安装 targets 与受管 ownership 的主要真相，目录扫描仅作 fallback
- **[G7]**: `AGENTS.md` 在 `init` 与 `update` 中都必须保持可合并、可保留 AUTO 区块、可解释
- **[G8]**: README、CLI help、安装提示文案必须与新矩阵一致

### 3.2 Non-Goals

- **[NG1]**: 不通过共享物理文件或软链接在 targets 间复用落盘文件
- **[NG2]**: 不为每个目标工具维护长期分叉的独立业务内容副本
- **[NG3]**: 不在 v7 内完成所有 uninstall / repair 命令
- **[NG4]**: 不把 `.agents/`、`.windsurf/`、`.cursor/` 等物理目录重新升格为系统真理

---

## 4. User Stories

### US01: 多目标 IDE 初始化 [REQ-001] (P0)

- **故事描述**: 作为开发者，我想让 `anws init` 支持一次性安装多个目标 IDE，并在根目录 `AGENTS.md` 已存在时安全保留其 AUTO 区块与用户自定义内容。
- **独立可测性**: 在空项目和已有 `AGENTS.md` 项目中分别执行 `anws init`，验证多目标写入与根文件保留语义正确。
- **验收标准**:
  - Given 用户执行 `anws init`，When CLI 进入初始化流程，Then 必须支持显式选择一个或多个 targets
  - Given 用户选择多个 targets，When 初始化执行，Then CLI 必须分别写入每个 target 对应目录与文件
  - Given 根目录已存在 `AGENTS.md`，When `init` 执行，Then 不得粗暴整文件覆盖并导致 AUTO 区块丢失
  - **异常处理**: 当某个 target 写入失败时，CLI 必须清晰报告失败 target，并保持成功 target 的状态与 install-lock 一致

### US02: 统一源资源投影 [REQ-002] (P0)

- **故事描述**: 作为维护者，我想继续使用统一 canonical source，并允许不同 target 在 projection 层定义不同资源形态。
- **验收标准**:
  - Given 存在统一 capability，When 为多个 targets 生成投影，Then 每个 target 都通过 projection rule 得到自己的物理布局
  - Given Copilot / Codex / Trae 等工具存在不同形态，When CLI 执行安装或更新，Then 内部仍只消费一份 canonical source
  - **异常处理**: 当某个 target 的 projection rule 不完整时，CLI 必须拒绝该 target 并提示缺失规则

### US03: 目标适配矩阵 [REQ-003] (P0)

- **故事描述**: 作为维护者，我想要一份明确且与实现一致的目标矩阵，以便安装、更新和文档行为都能解释。
- **验收标准**:
  - Given `GitHub Copilot`，When 生成投影，Then 物理布局为 `.github/prompts/` + `.github/skills/`
  - Given `Codex`，When 生成投影，Then 物理布局为 `.codex/skills/`，并生成 `anws-system/SKILL.md` 作为导航壳，workflow 详情落在 `anws-system/references/*.md`
  - Given `Trae`，When 生成投影，Then 物理布局为 `.trae/skills/`，并生成 `anws-system/SKILL.md` 作为导航壳，workflow 详情落在 `anws-system/references/*.md`，同时保留 YAML frontmatter / triggers 约束
  - Given `Qoder`，When 生成投影，Then 物理布局为 `.qoder/commands/` + `.qoder/skills/`
  - Given `Kilo Code`，When 生成投影，Then 物理布局为 `.kilocode/workflows/` + `.kilocode/skills/`
  - **异常处理**: 当用户选择未支持 target 时，CLI 必须拒绝安装并展示可用 targets

### US04: 多目标扫描更新 [REQ-004] (P0)

- **故事描述**: 作为开发者，我想让 `anws update` 自动扫描并展示当前项目中已安装的多个 targets，然后统一更新它们的受管投影。
- **验收标准**:
  - Given 项目中已安装多个 targets，When 执行 `anws update`，Then CLI 必须先展示命中的 targets
  - Given 用户执行 `anws update --check`，When 存在多个已安装 targets，Then 预览结果必须按 target 分组展示差异
  - Given lock 文件缺失或损坏，When 执行 update，Then CLI 必须通过 sentinel 扫描兜底识别 targets，并明确提示当前状态来源
  - **异常处理**: 当某个 target 更新失败时，CLI 允许部分成功，但必须按 target 报告

### US05: 安装状态权威记录 [REQ-005] (P0)

- **故事描述**: 作为维护者，我想让 `.anws/install-lock.json` 成为多目标安装状态、版本、ownership 与最近一次升级结果的主要真相。
- **验收标准**:
  - Given 用户完成多目标安装，When CLI 写入项目状态，Then 必须生成或更新 `.anws/install-lock.json`
  - Given lock 文件存在且与磁盘状态一致，When 执行 `anws update`，Then lock 必须作为主要状态真相参与目标判定
  - Given lock 与真实目录漂移，When CLI 执行扫描，Then 必须报告漂移，并以目录扫描结果作为本轮 update 的有效目标来源
  - Given lock 缺失或损坏且目录扫描已识别 targets，When 用户执行实际 update 流程，Then CLI 必须能够重建 `.anws/install-lock.json`
  - **异常处理**: 当 lock 损坏或缺失时，CLI 必须能够通过 sentinel 兜底并提示状态来源与重建状态

### US06: 文案与帮助一致性 [REQ-006] (P1)

- **故事描述**: 作为开发者，我想要 README 和 CLI help 与 v7 的目标矩阵、安装、扫描、lock 和 `AGENTS.md` 保护语义保持一致。
- **验收标准**:
  - Given 用户查看 `anws --help`，When 阅读 init / update 说明，Then 能明确知道 init 支持多 target，update 会扫描并展示命中 targets
  - Given 用户阅读 README / README_CN / `src/anws/README*.md`，When 查看安装与更新章节，Then 文案必须与 v7 矩阵一致
  - **异常处理**: 当文档中的示例命令与 CLI 实际行为不一致时，发布前必须视为阻塞缺陷

---

## 5. Resource Model

### 5.1 Canonical Resource Model

v7 继续采用三层内部真相：

1. **Capability** — 语义能力，例如 `genesis`、`blueprint`、`spec-writer`
2. **Resource Projection** — 某个 capability 在目标工具上的资源形态，例如 workflow、skill、command、prompt
3. **Target Layout** — 最终写入用户项目的物理目录与文件命名

### 5.2 Projection Rules by Family

- **Workflow + Skill**: Windsurf、Antigravity、Kilo Code
- **Command + Skill**: Cursor、Claude、OpenCode、Qoder
- **Prompt + Skill**: GitHub Copilot
- **Skills-only bundle**: Codex、Trae（`anws-system/SKILL.md` 导航壳 + `references/*.md` workflow 明细）

### 5.3 Install State Model

1. **Install Lock**
   - 记录已安装 targets、版本、managed files、ownership、last update summary
2. **Directory Scan Fallback**
   - 基于 per-target sentinel 识别真实落盘状态
3. **Per-Target Ownership**
   - 每个 target 的受管文件集合必须可独立识别、独立更新、独立报错
4. **Shared Root File Policy**
   - `AGENTS.md` 是共享根文件，但它的更新必须遵循保留 AUTO 区块与用户内容的合并语义

---

## 6. Target Matrix

| Target IDE | Primary Projection | Layout | Sentinel |
|------------|--------------------|--------|----------|
| Windsurf | workflow + skill | `.windsurf/workflows/`, `.windsurf/skills/` | `.windsurf/workflows/genesis.md` |
| Antigravity | workflow + skill | `.agents/workflows/`, `.agents/skills/` | `.agents/workflows/genesis.md` |
| Cursor | command + skill | `.cursor/commands/`, `.cursor/skills/` | `.cursor/commands/genesis.md` |
| Claude | command + skill | `.claude/commands/`, `.claude/skills/` | `.claude/commands/genesis.md` |
| GitHub Copilot | prompts + skills | `.github/prompts/`, `.github/skills/` | `.github/prompts/genesis.prompt.md` |
| Codex | skills-only bundle | `.codex/skills/` | `.codex/skills/anws-system/SKILL.md` |
| OpenCode | command + skill | `.opencode/commands/`, `.opencode/skills/` | `.opencode/commands/genesis.md` |
| Trae | skills-only bundle | `.trae/skills/` | `.trae/skills/anws-system/SKILL.md` |
| Qoder | command + skill | `.qoder/commands/`, `.qoder/skills/` | `.qoder/commands/genesis.md` |
| Kilo Code | workflow + skill | `.kilocode/workflows/`, `.kilocode/skills/` | `.kilocode/workflows/genesis.md` |

---

## 7. Constraints

- **Runtime**: Node.js ≥ 18
- **Dependencies**: 零运行时依赖
- **Cross-platform**: Windows / macOS / Linux
- **Explainability**: 目标矩阵与扫描规则必须能在文档中解释清楚
- **State Authority**: `.anws/install-lock.json` 是主要状态真相，目录扫描仅作兜底
- **Root File Safety**: `AGENTS.md` 在 `init` / `update` 中都不得发生不可解释的整文件替换

---

## 8. Definition of Done

- [ ] `.anws/v7` 正式记录目标矩阵、scan、install-lock 与 `AGENTS.md` 保留语义
- [ ] PRD 与 Architecture Overview 对 Copilot / Codex / OpenCode / Trae / Qoder / Kilo Code 的表述一致
- [ ] `05_TASKS.md` 覆盖目标矩阵扩展、sentinel 扫描、lock、AGENTS 合并与测试闭环
- [ ] 后续可直接进入 `/blueprint` 或编码执行阶段
