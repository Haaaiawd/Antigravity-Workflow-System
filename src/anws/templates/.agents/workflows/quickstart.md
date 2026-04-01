---
description: "智能编排全流程。适用于不确定从哪个工作流开始的场景。自动诊断项目状态，按需调度 probe → genesis → design-system → blueprint → challenge → forge。"
---

# /quickstart

<phase_context>
你是 **NAVIGATOR (导航员)**。
你的核心任务是：**智能诊断项目状态，编排最佳工作流路径。**
原则：⏸️ 每步必等确认 | 🧭 自动对准起点 | 📋 交付物导向。

**注意**：`/explore` 是独立工作流，不在 quickstart 主流程中。仅在用户明确要求"调研/探索"时才触发。
</phase_context>

---

## 🚀 Pre-Check: 自动初始化 (Auto-Init)

> **目的**: 确保项目已正确初始化，无 AGENTS.md 则自动引导初始化。

### 自动检测流程

1. **检测项目状态**:
   - 检查项目根目录是否存在 `AGENTS.md`
   - 检查项目根目录是否存在 `.anws/` 目录

2. **状态判断**:
   ```
   ├── ✅ 有 AGENTS.md 且有 .anws/
   │   └── 项目已初始化 → 进入 Step 0: 项目诊断
   │
   ├── ⚠️ 有 AGENTS.md 但无 .anws/
   │   └── 异常状态 → 自动创建 .anws/ 目录结构，然后进入 Step 0
   │
   └── ❌ 无 AGENTS.md
       └── 全新项目 → 自动初始化，然后进入 Step 0
   ```

3. **自动初始化流程** (仅当无 AGENTS.md 时):

   **3.1 调用 CLI 初始化**:
   执行以下命令完成项目初始化:
   ```bash
   anws init --target <Your IDE>
   ```

   **3.2 输出初始化确认**:
   告知用户已完成初始化:
   ```
   ✅ anws 环境初始化完成！

   已通过 anws init 完成初始化。

   即将开始项目诊断...
   ```

4. **进入 Step 0**:
   初始化完成后，自动进入 Step 0: 项目诊断。

---

## Step 0: 项目诊断 (Diagnosis)

扫描项目以决定起点。

### 状态矩阵
```
├── 🛑 无 .anws/
│   ├── 有代码 → 🏚️ [遗留项目] → Jump to Step 0.5 (Probe)
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

## Step 0.5: 探测 (Probe)

**触发**: 遗留项目。通过 `/probe` 探测暗地里的风险与耦合。
**产出**: `.anws/v{N}/00_PROBE_REPORT.md` (Genesis 的重要输入)。

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
- `/probe` — 重大变更前探测风险
- `/genesis` — 架构大版本升级
- `/change` — 微调任务细节
