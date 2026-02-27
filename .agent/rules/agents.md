# AGENTS.md - AI 协作协议

> **"如果你正在阅读此文档，你就是那个智能体 (The Intelligence)。"**
> 
> 这个文件是你的**锚点 (Anchor)**。它定义了项目的法则、领地的地图，以及记忆协议。
> 当你唤醒（开始新会话）时，**请首先阅读此文件**。

---

## 🧠 30秒恢复协议 (Quick Recovery)

**当你开始新会话或感到"迷失"时，立即执行**:

1. **读取 .agent/rules/agents.md** → 获取项目地图
2. **查看下方"当前状态"** → 找到最新架构版本
3. **读取 `genesis/v{N}/05_TASKS.md`** → 了解当前待办
4. **开始工作**

---

## 🗺️ 地图 (领地感知)

以下是这个项目的组织方式：

| 路径 | 描述 | 访问协议 |
|------|------|----------|
| `src/` | **实现层**。实际的代码库。 | 通过 Task 读/写。 |
| `genesis/` | **设计演进史**。版本化架构状态 (v1, v2...)。 | **只读**(旧版) / **写一次**(新版)。 |
| `genesis/v{N}/` | **当前真理**。最新的架构定义。 | 永远寻找最大的 `v{N}`。 |
| `.agent/workflows/` | **工作流**。`/genesis`, `/blueprint` 等。 | 通过 `view_file` 阅读。 |
| `.agent/skills/` | **技能库**。原子能力。 | 通过 `view_file` 调用。 |

---

## 📍 当前状态 (由 Workflow 自动更新)

> **注意**: 此部分由 `/genesis`、`/blueprint` 和 `/forge` 自动维护。

- **最新架构版本**: `genesis/v1`
- **活动任务清单**: `genesis/v1/05_TASKS.md`
- **最近一次更新**: `2026-02-25`

### 🌊 Wave 1 — 待 /blueprint 或 /forge 设置
_尚未开始执行_

---

## 🌳 项目结构 (Project Tree)

> **注意**: 此部分由 `/genesis` 维护。

```text
Antigravity-Workflow-System/
├── genesis/v1/                    # 架构文档 (Source of Truth)
│   ├── 00_MANIFEST.md
│   ├── 01_PRD.md
│   ├── 02_ARCHITECTURE_OVERVIEW.md
│   ├── 05_TASKS.md                # 由 /blueprint 生成
│   ├── 06_CHANGELOG.md
│   ├── 03_ADR/
│   │   ├── ADR_001_TECH_STACK.md
│   │   └── ADR_002_CONFLICT_DETECTION.md
│   └── 04_SYSTEM_DESIGN/          # 待 /design-system 填充
├── src/
│   └── anws/                      # CLI npm 包
│       ├── package.json
│       ├── bin/
│       │   └── cli.js             # 主入口 (shebang + parseArgs)
│       ├── lib/
│       │   ├── init.js
│       │   ├── update.js
│       │   ├── copy.js
│       │   └── manifest.js
│       └── templates/
│           └── .agent/            # 内嵌工作流模板
└── .agent/                        # 工作流系统自身
    ├── workflows/
    ├── skills/
    └── rules/
```

---

## 🧭 导航指南 (Navigation Guide)

> **注意**: 此部分由 `/genesis` 维护。

- **架构总览**: `genesis/v1/02_ARCHITECTURE_OVERVIEW.md`
- **产品需求**: `genesis/v1/01_PRD.md`
- **技术决策**: `genesis/v1/03_ADR/` (Tech Stack, Conflict Detection)
- **任务清单**: 待 `/blueprint` 执行后生成 `genesis/v1/05_TASKS.md`
- **详细系统设计**: 待 `/design-system` 执行后填充 `genesis/v1/04_SYSTEM_DESIGN/`
- **CLI System**: 源码 `src/anws/` → 设计 `genesis/v1/04_SYSTEM_DESIGN/cli-system.md`
- **Template Bundle**: 源码 `src/anws/templates/` (无单独设计文档)

---

## 🛠️ 工作流注册表

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/genesis` | 新项目 / 重大重构 | PRD, Architecture, ADRs |
| `/scout` | 变更前 / 接手项目 | `genesis/v{N}/00_SCOUT_REPORT.md` |
| `/design-system` | genesis 后 | 04_SYSTEM_DESIGN/*.md |
| `/blueprint` | genesis 后 | 05_TASKS.md + agents.md 初始 Wave |
| `/change` | 微调已有任务 | 更新 TASKS + SYSTEM_DESIGN (仅修改) + CHANGELOG |
| `/explore` | 调研时 | 探索报告 |
| `/challenge` | 决策前质疑 | 07_CHALLENGE_REPORT.md (含问题总览目录) |
| `/forge` | 编码执行 | 代码 + 更新 agents.md Wave 块 |
| `/craft` | 创建工作流/技能/提示词 | Workflow / Skill / Prompt 文档 |

---

## 📜 宪法 (The Constitution)

1. **版本即法律**: 不"修补"架构文档，只"演进"。变更必须创建新版本。
2. **显式上下文**: 决策写入 ADR，不留在"聊天记忆"里。
3. **交叉验证**: 编码前对照 `05_TASKS.md`。我在做计划好的事吗？
4. **美学**: 文档应该是美的。善用 Markdown 和 Emoji。

---

> **状态自检**: 准备好了？读取上方"当前状态"指引的架构文档并开始吧。
