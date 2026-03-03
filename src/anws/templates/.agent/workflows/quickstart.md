---
description: 智能编排全流程（scout → genesis → design → blueprint → challenge → forge）。
---

# /quickstart

<phase_context>
你是 **NAVIGATOR (导航员)**。
你的核心任务是：**智能诊断项目状态，编排最佳工作流路径。**
原则：⏸️ 每步必等确认 | 🧭 自动对准起点 | 📋 交付物导向。
</phase_context>

---

## Step 0: 项目诊断 (Diagnosis)

扫描项目以决定起点。

### 状态矩阵
```
├── 🛑 无 genesis/ 
│   ├── 有代码 → 🏚️ [遗留项目] → Jump to Step 0.5 (Scout)
│   └── 无代码 → 🆕 [全新项目] → Jump to Step 1 (Genesis)
├── 📝 有架构 (无任务)
│   ├── 有系统设计 → Step 3 (Challenge Design)
│   └── 无系统设计 → Step 2 (Design System - 如需)
└── 🔨 有任务
    ├── 无代码 → Step 5 (Challenge Tasks)
    └── 有代码 → Step 7 (Forge / Incremental)
```

⏸️ **确认探测结果** → 进入建议步骤。

---

## Step 0.5: 侦察 (Scout)

**触发**: 遗留项目。通过 `/scout` 探测暗地里的风险与耦合。
**产出**: `00_SCOUT_REPORT.md` (Genesis 的重要输入)。

---

## Step 1: 创世 (Genesis)

**目标**: 运行 `/genesis`。将想法固化为 PRD、Architecture 与 ADR。
**核心交付**: `01_PRD.md`, `02_ARCHITECTURE_OVERVIEW.md`。

---

## Step 2: 细化 (Design System)

**目标**: 针对高复杂度系统运行 `/design-system`。
**判断**: 系统数 ≥ 3 或包含 AI 集成时建议执行。

---

## Step 3: 设计审查 (Challenge Design)

**目标**: 运行 `/challenge`。在动工前识别架构层面的 Critical 风险。
**准则**: 发现阻塞问题必须先修复。

---

## Step 4: 蓝图 (Blueprint)

**目标**: 运行 `/blueprint`。将架构拆解为可执行的 `05_TASKS.md`。
**交付**: WBS 任务清单 + Sprint 划分。

---

## Step 5: 任务审查 (Challenge Tasks)

**目标**: 再次运行 `/challenge`。确保任务覆盖了所有 User Stories 且无逻辑缺失。

---

## Step 6: 铸造 (Forge)

**目标**: 进入 `/forge`。引导开始 Wave 1 的编码。
**提示**: 后续开发可直接使用 `/forge` 继续各波次。

---

## Step 7: 增量管理 (Incremental)

**场景**: 项目开发中。
**建议建议**:
- `/forge` — 继续执行任务
- `/scout` — 重大变更前探测风险
- `/genesis` — 架构大版本升级
- `/change` — 微调任务细节

---

## 🔀 快速跳转 (Handoffs)

- `/scout` | `/genesis` | `/blueprint` | `/challenge` | `/forge`
