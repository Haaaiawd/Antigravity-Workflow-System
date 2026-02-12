<div align="center">

<img src="assets/logo.png" width="200" alt="Antigravity Workflow System">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Target: Antigravity](https://img.shields.io/badge/Environment-Antigravity-blueviolet)](https://github.com/google-deepmind/antigravity)
[![Vibe Coding](https://img.shields.io/badge/Vibe%20Coding-Enabled-ff69b4)](https://github.com/karpathy/vibe-coding)

[English](./README.md) | [中文](./README_CN.md)

</div>

---

## ⚡ 这是什么？

专为 **Agentic AI**（智能体AI）设计的**结构化工作流框架**，旨在解决 **Vibe Coding** 时代的核心痛点。

> 💡 **一句话总结**: 别再让 AI 写“意大利面条代码”了。强迫它先像架构师一样思考，再像工程师一样编码。

### 🎯 我们解决的问题

| 痛点 | 问题描述 | 我们的解决方案 |
|------|----------|----------------|
| **架构漂移** | AI 在同一个项目中生成的代码风格不一致，缺乏整体观 | `/genesis` 强制先产出 PRD 和架构设计 |
| **面条代码** | AI 缺乏项目上下文，写的代码无法融入现有系统 | 任务包含严格的约束和验收标准 |
| **上下文健忘** | 新会话 = AI 忘记了之前所有的决策 | `.agent/rules/agents.md` + 版本化文档 = 持久记忆 |
| **缺乏规划** | Vibe Coding 跳过设计直接编码，导致技术债务 | 强制执行“设计优先”的工作流 |

---

## 🚀 快速开始

### 1. 复制到你的项目

```bash
# 克隆本仓库
git clone https://github.com/Haaaiawd/Antigravity-Workflow-System.git

# 将 .agent/ 目录复制到你的项目根目录
# Mac/Linux:
cp -r Antigravity-Workflow-System/.agent ./
# Windows PowerShell:
Copy-Item -Recurse Antigravity-Workflow-System/.agent -Destination .
```

### 2. 你的第一个项目 🐣

> **示例提示词**: "我想做一个 Web 版的 macOS 系统模拟器，包含 Dock、顶栏和几个系统应用，请你根据开发流程从0开启这个新项目吧"

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
    │   新项目   │      │  接手旧代码 │      │ 现有项目 │
    │   (New)  │      │  (Legacy) │      │  变更    │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                 │
         ▼                 ▼                 ▼
    /genesis          /scout         微调已有任务?
         │                 │            /       \
         │                 │           /         \
         └────────┬────────┘     /change      /genesis
                  │            (仅修改)    (新任务/新功能)
                  ▼                │            │
             /blueprint ◄──────────┴────────────┘
```

---

## 🔑 核心理念

### 1. 版本化架构 (Versioned Architecture)
> 不要“修补”架构文档，要**演进**它们。

- 发生重大变更时，从 `genesis/v1` 复制到 `genesis/v2`。
- 完整的决策可追溯性。
- 拒绝“本来就是这样”的玄学代码。

### 2. 深度思考优先 (Deep Thinking First)
> AI 必须先思考，再动笔。

- 工作流通过 `sequentialthinking` 强制进行多步推理。
- 使用 `[!IMPORTANT]` 块作为护栏。
- 拒绝肤浅的、扫描式的快速回答。

### 3. 文件即记忆 (Filesystem as Memory)
> 聊天是短暂的，文件是永恒的。

- `.agent/rules/agents.md` 是 AI 的锚点。
- 架构文档是持久化的决策记录。
- 新会话可迅速恢复完整上下文。

---

## 📋 工作流一览

| 命令 | 用途 | 输入 | 输出 |
|------|------|------|------|
| `/genesis` | 从零开始，创建 PRD 和架构 | 模糊的想法 | PRD, 架构文档, ADRs |
| `/scout` | 分析遗留代码的风险 | 现有代码 | 风险报告, 差距分析 |
| `/design-system` | 单个系统的详细设计 | 架构概览 | System Design 文档 |
| `/challenge` | 系统性三维度质疑审查 | 完整设计文档 | 质疑报告 (分级) |
| `/blueprint` | 将架构拆解为任务清单 | PRD + 架构 | TASKS.md (WBS) |
| `/change` | 微调已有任务（禁止新增） | 已有任务的微调需求 | 更新后的任务清单 + 设计文件 (仅修改) |
| `/explore` | 深度调研与头脑风暴 | 话题/问题 | 探索报告 |
| `/craft` | 创建工作流/技能/提示词 | 创建需求 | Workflow / Skill / Prompt 文档 |

---

## 🛠️ 兼容性与前置要求

> ⚠️ **重要**: 本框架需要支持 `.agent/workflows/` 的 **Antigravity** 环境。

| 环境 | 状态 | 说明 |
|------|:----:|------|
| **Antigravity** | ✅ 完美支持 | 支持全套工作流 + 技能 |
| Claude Code | ❌ 无原生工作流支持 | |
| Cursor | ❌ 无工作流支持 | |
| GitHub Copilot | ❌ 无工作流支持 | |

**什么是 Antigravity?**

Antigravity 是一个 Agentic AI 编程环境，它能原生识别 `.agent/workflows/` 目录，并执行 `/genesis`, `/blueprint` 等斜杠命令。

### 🔌 必装: Sequential Thinking MCP Server

本框架使用 `sequentialthinking` 实现深度推理。请通过 MCP Store 安装:

1. 打开 **Antigravity Editor**
2. 点击侧边栏 **"..."** (三个点) → **Additional Options**
3. 选择 **MCP Servers**
4. 打开 **MCP Store** 搜索 `sequential-thinking`
5. 点击 **Add** 安装

> 💡 未安装时工作流仍可运行，但深度思考功能会受限。

---

## ⚡ 调用工作流

Antigravity 会自动识别你的意图并触发相应的工作流。你有两种使用方式：

#### ⚡ 方式 A: 斜杠协议 (显式)
直接在聊天或编辑器中输入命令：
- `/genesis` - 启动项目创建
- `/scout` - 分析现有代码库
- `/blueprint` - 将架构拆解为任务

#### 🧠 方式 B: 意图协议 (隐式)
像平常说话一样即可。Antigravity 会自动选择并运行正确的工作流。
- *"我想做一个全新的待办事项 App"* → 触发 `/genesis`
- *"帮我看看这段老代码有什么风险"* → 触发 `/scout`
- *"我觉得这个设计有漏洞，帮我找找茬"* → 触发 `/challenge`
- *"架构设计好了，我们来规划一下任务"* → 触发 `/blueprint`
- *"把登录页的错误提示改一下"* → 触发 `/change` (微调已有任务)
- *"我需要加一个返回顶部按钮"* → 触发 `/genesis` (需要新任务)

---

## 📁 项目结构

```
your-project/
├── .agent/
│   ├── rules/
│   │   └── agents.md          # 🧠 AI 的锚点文件
│   ├── workflows/             # 工作流定义
│   │   ├── genesis.md
│   │   ├── scout.md
│   │   ├── design-system.md
│   │   ├── challenge.md
│   │   ├── blueprint.md
│   │   ├── change.md
│   │   └── explore.md
│   │
│   └── skills/            # 可复用的技能库
│       ├── concept-modeler/
│       ├── spec-writer/
│       ├── task-planner/
│       └── ...
│
└── genesis/               # 版本化的架构文档
    ├── v1/
    │   ├── 01_PRD.md
    │   ├── 02_ARCHITECTURE.md
    │   ├── 03_ADR/
    │   ├── 05_TASKS.md
    │   └── 07_CHALLENGE_REPORT.md
    └── v2/                # 重大变更时的新版本
```

---

## 📜 许可证

[MIT](LICENSE) © 2026

---

<div align="center">

**为懂代码的架构师，和会思考的 AI 而生。**

🧠 *"好的架构不是写出来的，是设计出来的。"*

</div>
