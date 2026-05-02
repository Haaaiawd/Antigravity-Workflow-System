<div align="center">

<img src="assets/logo-cli.png" width="260" alt="Anws">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v2.2.1-7FB5B6)](https://github.com/Haaaiawd/ANWS/releases)
[![Targets](https://img.shields.io/badge/Targets-Windsurf%20%7C%20Claude%20Code%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Codex%20Preview%20%7C%20OpenCode%20%7C%20Trae%20%7C%20Qoder%20%7C%20Kilo%20Code-blueviolet)](https://github.com/Haaaiawd/ANWS)

[English](./README.md) | [中文](./README_CN.md)

</div>

---

# Anws

**Anws** 是一个面向现代 AI IDE 与 AI 编程工具的、以规格驱动为核心的工作流框架。

它帮助团队通过一条受约束的路径，把软件从想法推进到可生产交付：

`PRD -> Architecture -> ADR -> Tasks -> Review -> Code -> Upgrade`

Anws 强调 design-first 原则，把上下文沉淀到文件里，并抑制多工具 AI 编程工作流中的架构漂移。

> **一句话**：一个面向 AI 编程工具的 design-first 工作流框架，把 vibe coding 拉回到面向生产的软件工程轨道。

## ANWS

- **Axiom** —— 先有原则，再有实现
- **Nexus** —— 先理解连接，再拆分系统
- **Weave** —— 先形成整体，再展开流程
- **Sovereignty** —— 始终由人保有判断与主导权

---

## 为什么需要 Anws

今天的 AI 编程常见失败模式非常稳定：

- **架构漂移**
  - 不同会话写出彼此不兼容的结构

- **上下文健忘**
  - 新会话丢失系统边界、权衡与任务状态

- **规划塌缩**
  - 需求和接口还没稳定，代码已经开始堆

- **升级失控**
  - 工作流模板在演进，但已有项目无法安全更新

Anws 用以下机制应对这些问题：

- **版本化架构文档**
  - 保存在 `.anws/v{N}/`

- **根锚点文件**
  - 通过 `AGENTS.md` 作为 AI 恢复上下文的入口

- **工作流优先执行**
  - 不再依赖 prompt 即兴发挥

- **受控更新语义**
  - 对 `AGENTS.md`、已安装 targets、升级历史进行显式管理

---

## v2.2.0 有什么变化

`v2.2.0` 把设计审查、任务审查、代码实现与升级安全连成闭环。

- **闭环 challenge 审查**
  - `/challenge` 现在组合 `design-reviewer`、`task-reviewer` 与 `code-reviewer`
  - 实现代码会对照 PRD、Architecture、ADR、System Design 与 `05_TASKS.md` 检查漂移
  - 发现会写入 `07_CHALLENGE_REPORT.md`，并使用契约优先的严重度语义

- **代码忠实度证据层**
  - 新增 `code-reviewer` skill，用于检查 Contract Drift、Task Drift、Test Drift、Missing Change Backflow 与基础逻辑测试缺口
  - 它只做静态、证据驱动的审查，不伪装成运行时验证已经通过

- **跨工作流契约闭合**
  - `blueprint`、`task-planner`、`task-reviewer`、`challenge`、`change` 与 `forge` 显式承接公共契约覆盖
  - API、CLI、配置、文件格式、错误语义、持久化结构与验证责任都会作为一等工作流关注点处理

- **Forge 验证门禁**
  - `/forge` 在继续实现前会读取最新 `07_CHALLENGE_REPORT.md`
  - 未解决 Critical 阻塞 forge；未解决 High 需要明确的人类确认
  - 高风险实现波次可在人工验证前运行 `code-reviewer`
  - 涉及 UI 或端到端路径时，用 **`e2e-testing-guide`** 组织浏览器辅助或手动验收（无浏览器工具时在 skill 内降级为指南模式）

---

## v2.0.0 有什么变化

`v2.0.0` 是一次 **Major Release**，不是简单的模板刷新，而是协议级升级。

- **统一架构根目录**
  - 从历史拆分根目录收束到 `.anws/`
  - 统一版本文档与升级记录的存放方式

- **`AGENTS.md` 进入受控更新**
  - 带标识文件走 merge
  - 可识别 legacy 文件自动 migrate
  - 不可识别 legacy 文件安全保留

- **多目标 IDE 投放模型落地**
  - 一份 canonical source
  - 多个目标 IDE 原生目录布局
  - 各 target 拥有自己独立的物理文件

- **Codex 投放策略调整**
  - Codex 现在标记为 **Preview**
  - 由于 Codex 已取消 prompts，Anws 改为将工作流指导聚合到 `.codex/skills/anws-system/`
  - `SKILL.md` 是该 bundle 的导航壳
  - 包括 `/quickstart` 在内的 workflow 明细统一放在 `references/*.md`

- **Trae / Qoder / Kilo Code 支持**
  - Trae 与 Codex 同属 skills-only bundle 家族，投放到 `.trae/skills/anws-system/`
  - Qoder 新增 `.qoder/commands/` + `.qoder/skills/`
  - Kilo Code 新增 `.kilocode/workflows/` + `.kilocode/skills/`

- **OpenCode 支持**
  - 新增 `.opencode/commands/` 与 `.opencode/skills/` 原生投放
  - `init`、`update`、manifest 归属、drift detection 与 diff 流程已一并适配

- **`anws update` 语义增强**
  - 感知 install-lock
  - 支持目录扫描 fallback
  - 支持 drift detection
  - 支持按 target 输出更新摘要

- **内置生态集成**
  - 集成 `nexus-skills`
  - 以 `nexus-mapper` 作为 `/probe` 的结构分析骨干
  - 完成从 legacy `/scout` 到 `/probe` 的工作流语义切换

- **CLI 品牌体验升级**
  - 统一 logo
  - 品牌化确认框
  - changelog 生成
  - 更完整的交互反馈

---

## 快速开始

### 通过 npm 安装

```bash
npm install -g @haaaiawd/anws
cd your-project
anws init
```

- **要求**
  - Node.js `>= 18`

- **安装行为**
  - `anws init` 会把工作流投影安装到一个或多个目标 IDE 的原生目录
  - 示例：`anws init --target windsurf,opencode`

### 更新已有项目

```bash
cd your-project
anws update
```

- **CLI 约束**
  - `anws update --check` 与 `anws update --target` 已移除；请直接执行 `anws update` 一次性刷新所有已匹配 target

- **状态来源**
  - `anws update` 优先读取 `.anws/install-lock.json`
  - 若 lock 缺失或损坏，则回退为目录扫描
  - 若检测到 lock drift，则本轮 update 以目录扫描结果作为有效来源
  - 当 fallback 生效时，真实执行 `anws update` 可以根据检测结果重建 `.anws/install-lock.json`

- **`AGENTS.md` 更新规则**
  - 带标识文件 -> 更新稳定区，保留 `AUTO` 区块
  - 可识别 legacy 文件 -> 自动迁移到新结构
  - 不可识别 legacy 文件 -> 警告并原样保留

- **legacy 迁移**
  - 若项目仍有 `.agent/`，CLI 可引导迁移到 `.agents/`
  - 迁移成功后，交互模式下还可继续确认是否删除旧 `.agent/`

- **升级记录**
  - 每次成功更新都会刷新 `.anws/changelog/`
  - target 状态会回写到 `.anws/install-lock.json`

---

## 给老用户的迁移说明

如果你使用过旧版 Anws / Antigravity 布局，那么 `v2.0.0` 主要意味着：

- **目录协议变化**
  - 历史里的 `genesis/` 与 `anws/changelog/` 叙述应统一替换为 `.anws/`

- **`AGENTS.md` 不再是“永远 skip”**
  - 它现在是一个受控托管文件，具有 merge / migrate / preserve 语义

- **target 安装成为一等模型**
  - Anws 现在显式建模不同 IDE 目标

如果你还维护旧模板、旧 Release 文案或旧文档截图，发布前建议一起完成术语收口。

---

## 兼容性

Anws 维护一份统一的工作流 / 技能源，然后将其投影到各个 AI 工具要求的原生目录结构中。
当前所有已支持 target 都会获得：

- 根目录 `AGENTS.md`
- target 原生的 `skills/` 投影
- 一个符合该工具语义的工作流入口层：
  - `workflows`
  - `commands`
  - `prompts`
  - Codex / Trae skills-only bundle 的聚合 `skills`

| 环境 | 状态 | 目录布局 |
| --- | --- | --- |
| **Windsurf** | ✅ 完整支持 | `AGENTS.md` + `.windsurf/workflows/` + `.windsurf/skills/` |
| **Antigravity** | ✅ 完整支持 | `.agents/workflows/` + `.agents/skills/` + `AGENTS.md` |
| **Claude Code** | ✅ 完整支持 | `AGENTS.md` + `.claude/commands/` + `.claude/skills/` |
| **GitHub Copilot** | ✅ 完整支持 | `AGENTS.md` + `.github/prompts/` + `.github/skills/` |
| **Cursor** | ✅ 支持 | `AGENTS.md` + `.cursor/commands/` + `.cursor/skills/` |
| **Codex** | ⚠️ Preview | `AGENTS.md` + `.codex/skills/anws-system/` + `.codex/skills/<skill>/` |
| **OpenCode** | ✅ 支持 | `AGENTS.md` + `.opencode/commands/` + `.opencode/skills/` |
| **Trae** | ✅ 支持 | `AGENTS.md` + `.trae/skills/anws-system/` + `.trae/skills/<skill>/` |
| **Qoder** | ✅ 支持 | `AGENTS.md` + `.qoder/commands/` + `.qoder/skills/` |
| **Kilo Code** | ✅ 支持 | `AGENTS.md` + `.kilocode/workflows/` + `.kilocode/skills/` |

---

## 推荐工作流

使用 Anws 时，推荐把它当成一个完整生命周期，而不是单纯的目录模板包。

| 命令 | 用途 | 输入 | 输出 |
| --- | --- | --- | --- |
| **`/quickstart`** | 智能分流到正确工作流路径 | 自动识别状态 | 全流程编排 |
| `/genesis` | 从零开始建立 PRD 与架构 | 模糊想法 | PRD、架构、ADR |
| `/probe` | 在变更前分析遗留系统 | 现有代码 | 风险报告 |
| `/design-system` | 为单个系统做深入设计 | 架构概览 | 系统设计文档 |
| `/challenge` | 对设计、任务与实现忠实度做对抗式审查 | 文档 / 任务 / 代码 | 质疑报告 |
| `/blueprint` | 将架构拆成可执行任务 | PRD + 架构 | `05_TASKS.md` |
| `/forge` | 在 challenge 报告与契约门禁下将任务锻造成代码 | 任务清单 + 审查状态 | 可运行实现 |
| `/change` | 只修改既有任务，不新增能力 | 小范围变更 | 更新后的任务 / 设计文档 |
| `/explore` | 深度调研不确定问题 | 主题 | 探索报告 |
| `/craft` | 创建工作流、技能、提示词 | 创建需求 | 可复用资产 |
| `/upgrade` | 在 update 后路由升级编排 | 更新记录 | `/change` 或 `/genesis` 路径 |

---

## 核心原则

### 1. 版本化架构

- 架构应该被**演进**，而不是被悄悄改写
- 重大结构调整从 `.anws/v1` 进入 `.anws/v2`
- ADR 保存的是“为什么要这样设计”

### 2. 文件即记忆

- `AGENTS.md` 是恢复入口
- `.anws/v{N}/` 保存长期架构上下文
- `.anws/changelog/` 保存升级历史

### 3. 先思考，再编码

- 工作流会强制经历阶段化推理
- 内置 `sequential-thinking` skill 统一深度分析路径
- 通过 review 节点在代码落地前拦截漂移：`/challenge` 可选接入 **code-reviewer**（实现侧静态证据）；`/forge` 在提交前强制执行同一 skill 作为忠实度门禁；浏览器/E2E 手动验收可走 **e2e-testing-guide**
- 各 IDE 仅保证同一套**投影文件**落地；子代理、浏览器工具是否可用取决于宿主环境，需在 skill 内做 **capability profile** 降级（同 agent 执行或仅交付指南）

---

## 项目结构

```bash
your-project/
├── .anws/
│   ├── install-lock.json
│   ├── changelog/
│   └── v{N}/
├── AGENTS.md
├── .windsurf/
│   ├── workflows/
│   └── skills/
├── .agents/
│   ├── workflows/
│   └── skills/
├── .cursor/
│   ├── commands/
│   └── skills/
├── .claude/
│   ├── commands/
│   └── skills/
├── .github/
│   ├── prompts/
│   └── skills/
├── .opencode/
│   ├── commands/
│   └── skills/
├── .qoder/
│   ├── commands/
│   └── skills/
├── .kilocode/
│   ├── workflows/
│   └── skills/
├── .trae/
│   └── skills/
│       ├── anws-system/
│       │   ├── SKILL.md
│       │   └── references/
│       └── <skill>/
│           └── SKILL.md
└── .codex/
    ├── skills/
    │   ├── anws-system/
    │   │   ├── SKILL.md
    │   │   └── references/
    │   └── <skill>/
    │       └── SKILL.md
```

> 一份统一源模型，多套目标布局，磁盘上显式归属。

---

## 用自己构建自己

Anws 本身就是用 Anws 的工作流构建出来的。

- **架构设计**
  - CLI 本身通过 `/genesis` 设计

- **任务拆解**
  - 实施工作通过 `/blueprint` 规划

- **执行落地**
  - 代码与文档通过 `/forge` 推进

这个仓库本身就是产品，同时也是一份参考实现。

**深度思考与架构设计**  
<img src="assets/genesis工作流演示.jpg" width="800" alt="Genesis Workflow">

**交互式需求对齐**  
<img src="assets/与人类交互确认细节.jpg" width="800" alt="Human Interaction">

**自主调用技能执行**  
<img src="assets/自主调用skills.jpg" width="800" alt="Skills Execution">

## Contributing

欢迎贡献。在提交 PR 前，请确保改动遵循 spec-driven workflow 与 target projection 模型。

---

## License

[MIT](LICENSE) © 2026

---

<div align="center">

**为懂代码的架构师，和会思考的 AI 而生。**

*好的架构不是写出来的，而是设计出来的。*

</div>
