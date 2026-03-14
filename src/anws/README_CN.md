<div align="center">

<img src="assets/logo.png" width="200" alt="Anws">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Multi-Tool](https://img.shields.io/badge/Support-Claude%20Code%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Windsurf-blueviolet)](https://github.com/Haaaiawd/Anws)
[![Vibe Coding](https://img.shields.io/badge/Vibe%20Coding-Enabled-ff69b4)](https://github.com/karpathy/vibe-coding)

[English](./README.md) | [中文](./README_CN.md)

</div>

---

## ⚡ 这是什么？

**Anws** — 专为 **Agentic AI**（智能体AI）设计的**结构化工作流框架**，旨在解决 **Vibe Coding** 时代的核心痛点。

> 💡 **一句话总结**: 别再让 AI 写“意大利面条代码”了。强迫它先像架构师一样思考，再像工程师一样编码。

### ANWS

**Axiom —— 先有原则，再有实现。**  
**Nexus —— 先理解连接，再拆分系统。**  
**Weave —— 先形成整体，再展开流程。**  
**Sovereignty —— 始终由人保有判断与主导权，AI 只是工具，不是权威。**

**支持工具**: Claude Code、GitHub Copilot、Cursor、Windsurf。

### 🎯 我们解决的问题

| 痛点           | 问题描述                                          | 我们的解决方案                                   |
| -------------- | ------------------------------------------------- | ------------------------------------------------ |
| **架构漂移**   | AI 在同一个项目中生成的代码风格不一致，缺乏整体观 | `/genesis` 强制先产出 PRD 和架构设计             |
| **面条代码**   | AI 缺乏项目上下文，写的代码无法融入现有系统       | 任务包含严格的约束和验收标准                     |
| **上下文健忘** | 新会话 = AI 忘记了之前所有的决策                  | `AGENTS.md` + 版本化文档 = 持久记忆 |
| **缺乏规划**   | Vibe Coding 跳过设计直接编码，导致技术债务        | 强制执行“设计优先”的工作流                       |

---

## 🚀 快速开始

### 方式 A — npm CLI（推荐）

```bash
npm install -g @haaaiawd/anws
cd your-project
anws init
```

> 需要 Node.js ≥ 18。
> `anws init` 会先让你选择目标 AI IDE，然后只安装该目标所需的托管文件。

### 方式 B — GitHub Release

从 [Releases](https://github.com/Haaaiawd/Anws/releases) 下载最新 `.zip`，再按你的目标 AI IDE 复制对应目录。更推荐使用 npm CLI，因为它会自动选择正确的目标布局。

### 📦 更新已有安装

```bash
cd your-project
anws update
```

> `anws update --check` 会先输出文件级和内容级 diff 预览，**不会写入任何文件**。
> `anws update` 会先识别当前项目已安装的目标 IDE 投影，只更新该目标的托管文件；当目标为 `Antigravity` 时，仍会按规则处理 `AGENTS.md`：
> - 带标识的 `AGENTS.md` → 更新稳定区，保留 `AUTO` 运行态区块
> - 可识别的 legacy `AGENTS.md` → 迁移到新的带标识结构
> - 不可识别的 legacy `AGENTS.md` → 警告并原样保留
> 如果项目里仍有旧版 `.agent/` 目录，CLI 会询问你是否迁移到 `.agents/`。
> legacy 迁移成功后，在交互模式下 CLI 还会进一步询问你是否删除旧 `.agent/` 目录。

### 你的第一个项目 🐣

> **最简单的上手方式**: 直接运行 `/quickstart` 命令！AI 会自动检测你的项目状态，并一步步引导你完成从需求 (`/genesis`) 到编码 (`/forge`) 的全生命周期。新手只用这一个命令就够了！

**需要灵感？备选示例提示词**: "我想做一个 Web 版的 macOS 系统模拟器，包含 Dock、顶栏和几个系统应用，请你根据开发流程从0开启这个新项目吧"

### 🔁 用自己写自己 (Dogfooding)

有趣的事实：**这个 CLI 工具（`anws`）本身就是用它自己的工作流构建的！**
我们使用了 `/genesis` 工作流来设计 CLI 的架构，并用 `/forge` 工作流来实现代码。此项目本身就是 Anws 能力的最佳证明。

**深度思考与架构设计**：AI 将会自动执行 `/genesis` 工作流，深度思考项目需求并产出 PRD 与架构设计。
<img src="assets/genesis工作流演示.jpg" width="800" alt="Genesis Workflow">

**交互式需求对齐**：AI 会针对模糊需求进行追问，确保设计符合你的直觉。
<img src="assets/与人类交互确认细节.jpg" width="800" alt="Human Interaction">

**自主任务拆解与执行**：AI 会自主调用必要的 Skills（如 `spec-writer`, `task-planner` 等）来完成文档建设与任务拆解。
<img src="assets/自主调用skills.jpg" width="800" alt="Skills Execution">

---

## 🗺️ 决策流程图

```
                    ┌─────────────────┐
                    │     你目前在哪?    │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   新项目  │     │ 接手旧代码 │     │  现有项目 │
    │   (New)  │      │  (Legacy) │     │  变更    │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                 │
         ▼                 ▼                 ▼
    /genesis          /probe         微调已有任务?
         │                 │            /       \
         │                 │           /         \
         └────────┬────────┘     /change      /genesis
                  │            (仅修改)    (新任务/新功能)
                  ▼                │            │
           /design-system <--------+------------+
           (可选，强烈建议)
                  |
                  v
            /challenge
            (设计审查)
                  |
                  v
             /blueprint
                  |
                  v
            /challenge
            (任务审查)
                  |
                  v
               /forge
              (代码交付)
```

---

## 🔑 核心理念

### 1. 版本化架构 (Versioned Architecture)
> 不要“修补”架构文档，要**演进**它们。

- 发生重大变更时，从 `.anws/v1` 复制到 `.anws/v2`。
- 完整的决策可追溯性。
- 拒绝“本来就是这样”的玄学代码。

### 2. 深度思考优先 (Deep Thinking First)
> AI 必须先思考，再动笔。

- 工作流通过内置的 `sequential-thinking` skill 强制进行多步推理。
- 使用 `[!IMPORTANT]` 块作为护栏。
- 拒绝肤浅的、扫描式的快速回答。

### 3. 文件即记忆 (Filesystem as Memory)
> 聊天是短暂的，文件是永恒的。

- `AGENTS.md` 是 AI 的锚点。
- 架构文档是持久化的决策记录。
- 新会话可迅速恢复完整上下文。

---

## 📋 工作流一览

| 命令              | 用途                                       | 输入               | 输出                                 |
| ----------------- | ------------------------------------------ | ------------------ | ------------------------------------ |
| **`/quickstart`** | **统一入口：智能感知状态并编排全生命周期** | 无                 | 全推工作流引导与自动化调度           |
| `/genesis`        | 从零开始，创建 PRD 和架构                  | 模糊的想法         | PRD, 架构文档, ADRs                  |
| `/probe`         | 分析遗留代码的风险                         | 现有代码           | 风险报告, 差距分析                   |
| `/design-system`  | 单个系统的详细设计                         | 架构概览           | System Design 文档                   |
| `/challenge`      | 智能判定审查模式（设计审查与任务清单审查） | 完整设计文档       | 质疑报告 (分级)                      |
| `/blueprint`      | 将架构拆解为任务清单                       | PRD + 架构         | TASKS.md (WBS)                       |
| `/forge`          | 执行任务 — 将架构锻造为代码                | TASKS.md           | 可运行的代码，已验证                 |
| `/change`         | 微调已有任务（禁止新增）                   | 已有任务的微调需求 | 更新后的任务清单 + 设计文件 (仅修改) |
| `/explore`        | 深度调研与头脑风暴                         | 话题/问题          | 探索报告                             |
| `/craft`          | 创建工作流/技能/提示词                     | 创建需求           | Workflow / Skill / Prompt 文档       |

---

## 🛠️ 兼容性与前置要求

> ⚠️ **重要**: 本框架支持能消费 `anws` 目标目录投放的 AI 编程工具，例如 `.windsurf/`、`.agents/`、`.cursor/`、`.claude/`、`.github/`、`.codex/`。

| 环境            |        状态        | 说明                  |
| --------------- | :----------------: | --------------------- |
| **Windsurf**       |     ✅ 完美支持     | `.windsurf/workflows/` + `.windsurf/skills/` |
| **Antigravity**    |     ✅ 完美支持     | `.agents/workflows/` + `.agents/skills/` + `AGENTS.md` |
| **Claude Code**    |     ✅ 完美支持     | `.claude/commands/` |
| **GitHub Copilot** |     ✅ 完美支持     | `.github/agents/` + `.github/prompts/` |
| **Cursor**         |     ✅ 支持        | `.cursor/commands/` |
| **Codex**          |     ✅ 支持        | `.codex/prompts/` + `.codex/skills/` |

**工作原理**: Anws 维护一套统一的工作流 / 技能源，再把它投影到你选择的目标 IDE 所需目录中。`AGENTS.md` 仍是 Antigravity 兼容目标的根锚点，其他目标则使用各自的原生目录布局。

### ✅ 内置深度推理支持

本框架已内置 `sequential-thinking` skill，用于结构化深度推理。

- 默认推理主链路**不再依赖**额外的 MCP 安装
- 所有工作流和 skills 统一使用 `sequential-thinking` 调用口径
- 内置示例覆盖修正推理、分支推理与结构化影响分析

> 💡 框架默认推理流程已不再依赖旧版 Sequential Thinking MCP Server。

---

## ⚡ 调用工作流

你的 AI 工具会自动识别你的意图并触发相应的工作流。你有两种使用方式：

#### ⚡ 方式 A: 斜杠协议 (显式)
直接在聊天或编辑器中输入命令：
- `/genesis` - 启动项目创建
- `/probe` - 分析现有代码库
- `/blueprint` - 将架构拆解为任务

#### 🧠 方式 B: 意图协议 (隐式)
像平常说话一样即可。你的 AI 工具会自动选择并运行正确的工作流。
- *"我想做一个全新的待办事项 App"* → 触发 `/genesis`
- *"帮我看看这段老代码有什么风险"* → 触发 `/probe`
- *"我觉得这个设计有漏洞，帮我找找茬"* → 触发 `/challenge`
- *"架构设计好了，我们来规划一下任务"* → 触发 `/blueprint`
- *"把登录页的错误提示改一下"* → 触发 `/change` (微调已有任务)
- *"我需要加一个返回顶部按钮"* → 触发 `/genesis` (需要新任务)

---

## 📁 项目结构

```
your-project/
├── AGENTS.md          # 🧠 AI 的锚点文件 (通用)
├── .agents/
│   ├── workflows/             # 工作流定义
│   │   ├── genesis.md
│   │   ├── probe.md
│   │   ├── design-system.md
│   │   ├── challenge.md
│   │   ├── blueprint.md
│   │   ├── forge.md
│   │   ├── change.md
│   │   ├── explore.md
│   │   └── craft.md
│   │
│   └── skills/            # 可复用的技能库
│       ├── concept-modeler/
│       ├── spec-writer/
│       ├── task-planner/
│       ├── nexus-mapper/     # 代码库知识映射
│       └── ...
│
└── .anws/                 # 版本化的架构文档
    ├── v1/
    │   ├── 01_PRD.md
    │   ├── 02_ARCHITECTURE.md
    │   ├── 03_ADR/
    │   ├── 05_TASKS.md
    │   └── 07_CHALLENGE_REPORT.md
    └── v2/                # 重大变更时的新版本
```

## 🙌 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📜 许可证

[MIT](LICENSE) © 2026

---

<div align="center">

**为懂代码的架构师，和会思考的 AI 而生。**

🧠 *"好的架构不是写出来的，是设计出来的。"*

---

## 📦 集成: nexus-skills

Anws 集成了 **[nexus-skills](https://github.com/Haaaiawd/nexus-skills)** 用于代码库知识映射:

- **nexus-mapper**: 分析仓库并生成 `.nexus-map/` 知识库，用于 AI 冷启动
- **nexus-query**: 开发过程中的即时结构查询

`/probe` 工作流利用 nexus-mapper 的 PROBE 协议进行深度代码库分析，检测隐藏风险、耦合热点和架构漂移。

</div>
