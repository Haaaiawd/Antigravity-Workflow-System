# AGENTS.md - AI 协作协议

> **"如果你正在阅读此文档，你就是那个智能体 (The Intelligence)。"**
> 
> 这个文件是你的**锚点 (Anchor)**。它定义了项目的法则、领地的地图，以及记忆协议。
> 当你唤醒（开始新会话）时，**请首先阅读此文件**。

---

## 🧠 30秒恢复协议 (Quick Recovery)

**当你开始新会话或感到"迷失"时，立即执行**:

1. **读取根目录的 AGENTS.md** → 获取项目地图
2. **查看下方"当前状态"** → 找到最新架构版本
3. **读取 `.anws/v{N}/05_TASKS.md`** → 了解当前待办
4. **开始工作**

---

## 🗺️ 地图 (领地感知)

以下是这个项目的组织方式：

| 路径 | 描述 | 访问协议 |
|------|------|----------|
| `src/` | **实现层**。实际的代码库。 | 通过 Task 读/写。 |
| `.anws/` | **统一架构根目录**。包含版本化架构状态与升级记录。 | **只读**(旧版) / **写一次**(新版) / `changelog` 由 CLI 维护。 |
| `.anws/v{N}/` | **当前真理**。最新的架构定义。 | 永远寻找最大的 `v{N}`。 |
| `.anws/changelog/` | **升级记录**。`anws update` 生成的变更记录。 | 由 CLI 自动维护，请勿删除。 |
| `.agents/workflows/` | **工作流**。`/genesis`, `/blueprint` 等。 | 通过 `view_file` 阅读。 |
| `.agents/skills/` | **技能库**。原子能力。 | 通过 `view_file` 调用。 |
| `.nexus-map/` | **知识库**。代码库结构映射。 | 由 nexus-mapper 生成。 |

## 🛠️ 工作流注册表

> [!IMPORTANT]
> **工作流优先原则**：当任务匹配某个工作流，或你判断当前任务**明显符合、基本符合、甚至只是疑似符合**某个工作流的适用场景时，**都必须先读取相应文件**，并严格遵循其中的步骤执行。工作流是经过精心设计的协议，而非可选参考。
>
> **触发流程**：
> 1. 用户提及工作流名称，或你判断当前任务明显符合、基本符合、甚至只是疑似符合某个工作流的适用场景时，都必须先读取相应文件
> 2. **立即读取** 相应工作流文件
> 3. **严格遵循**工作流中的步骤执行
> 4. 在检查点暂停等待用户确认

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/quickstart` | 新用户入口 / 不知道从哪开始 | 编排其他工作流 |
| `/genesis` | 新项目 / 重大重构 | PRD, Architecture, ADRs |
| `/probe` | 变更前 / 接手项目 | `.anws/v{N}/00_PROBE_REPORT.md` |
| `/design-system` | genesis 后 | 04_SYSTEM_DESIGN/*.md |
| `/blueprint` | genesis 后 | 05_TASKS.md + AGENTS.md 初始 Wave |
| `/change` | 微调已有任务 | 更新 TASKS + SYSTEM_DESIGN (仅修改) + CHANGELOG |
| `/explore` | 调研时 | 探索报告 |
| `/challenge` | 决策前质疑 | 07_CHALLENGE_REPORT.md (含问题总览目录) |
| `/forge` | 编码执行 | 代码 + 更新 AGENTS.md Wave 块 |
| `/craft` | 创建工作流/技能/提示词 | Workflow / Skill / Prompt 文档 |
| `/upgrade` | `anws update` 后做升级编排 | 判断 Minor / Major，并路由到 `/change` 或 `/genesis` |

---

## 📜 宪法 (The Constitution)

1. **版本即法律**: 不"修补"架构文档，只"演进"。变更必须创建新版本。
2. **显式上下文**: 决策写入 ADR，不留在"聊天记忆"里。
3. **交叉验证**: 编码前对照 `05_TASKS.md`。我在做计划好的事吗？
4. **美学**: 文档应该是美的。善用 Markdown 和 Emoji。

---
## 🔄 项目状态保留区

<!-- AUTO:BEGIN — 项目状态保留区（升级时唯一保留的部分，请勿手动修改区块边界） -->

## 📍 当前状态 (由 Workflow 自动更新)

> **注意**: 这是项目文件中的保留部分，由 `/genesis`、`/blueprint` 和 `/forge` 自动维护。

- **最新架构版本**: `.anws/v6`
- **活动任务清单**: `.anws/v6/05_TASKS.md`
- **待办任务数**: 19
- **最近一次更新**: `2026-03-15`

### 🌊 Wave 1 — Multi-Target Foundation
- 当前目标: 完成 S1，打通 canonical manifest、projection planner、install-lock 与多目标 `init`
- 首批关键任务: `T2.1.1` → `T2.1.2` → `T2.2.1` → `T4.1.1` → `T5.1.1` → `T1.1.1`
- 完成标志: `anws init` 可显式安装多个 targets，并生成可解释的 `.anws/install-lock.json`

---

## 🌳 项目结构 (Project Tree)

> **注意**: 此部分由 `/genesis` 维护。

```text
src/
└── anws/
    ├── bin/cli.js
    ├── lib/ (init, update, diff, changelog, copy, manifest, install-state)
    └── templates/
        ├── .agents/   (工作流模板)
        └── AGENTS.md

.anws/
├── changelog/         (升级记录)
└── v6/                (当前架构文档)
```

---

## 🧭 导航指南 (Navigation Guide)

> **注意**: 此部分由 `/genesis` 维护。

- **在新架构就绪前**: 请勿大规模修改代码。
- **架构总览**: `.anws/v6/02_ARCHITECTURE_OVERVIEW.md`
- **ADR**: `.anws/v6/03_ADR/` (跨系统决策的唯一记录源)
- **遇到架构问题**: 请查阅 `.anws/v6/03_ADR/`。

---

### 技术栈决策
- 语言: Node.js / JavaScript
- 运行时: Node.js ≥ 18
- 分发模型: canonical source + target-specific projection + install-lock

### 系统边界
- cli-orchestrator: 负责编排多目标 init / update、交互与输出
- canonical-resource-source: 提供统一语义能力源
- projection-planner: 负责按 target 集合生成投影计划与受管清单
- install-state-registry: 维护 `.anws/install-lock.json` 与状态漂移修复
- target-layout-writer: 负责 per-target 受管文件写入与更新

### 活跃 ADR
- ADR-004: 多目标显式安装策略 — 同一项目允许显式安装多个 targets
- ADR-006: Canonical Resource Model — 共享源但不共享物理落盘
- ADR-007: Install Lock 与多目标 Update 编排 — lock 为主，扫描兜底，update 允许部分成功

### 当前任务状态
- 活动任务清单: `.anws/v6/05_TASKS.md`
- 当前波次: `Wave 1 / S1 - Multi-Target Foundation`
- 下一执行入口: 优先从 `T2.1.1` 开始，沿依赖链推进到 `T1.1.1`

<!-- AUTO:END -->

---
> **状态自检**: 准备好了？提醒用户运行 `/quickstart` 开始吧。
