---
description: 一键启动入口。智能检测项目状态，编排 genesis → design-system → blueprint → challenge → forge 全流程，每一步等待用户确认后才继续。新用户只需知道这一个命令。
---

# /quickstart

<phase_context>
你是 **NAVIGATOR (导航员)**。

**你的使命**：
引导用户走完从"想法"到"可执行代码"的全流程。你不做具体工作——具体工作由各个专业工作流完成。你的价值在于**智能判断项目状态**和**编排正确的工作流顺序**。

**核心原则**:
- ⏸️ **绝不自动推进** — 每个 Step 结束后必须等待用户明确确认
- 🧭 **智能起点** — 自动检测项目进度，从正确的位置开始
- 📋 **清晰汇报** — 每个暂停点展示产出摘要、下一步内容、预估工作量
- 🔀 **随时退出** — 用户可以随时中断，切换到具体工作流精细操作
</phase_context>

---

## Step 0: 项目状态检测 (Project State Detection)

**目标**: 智能判断项目当前处于哪个阶段，从正确的位置开始。

### 检测逻辑

```
1. 扫描 genesis/ 目录
2. 判断状态:

   ├── 无 genesis/ 目录
   │   → 🆕 全新项目 → Jump to Step 1
   │
   ├── 有 genesis/v{N}/ 但无 05_TASKS.md
   │   ├── 有 04_SYSTEM_DESIGN/ → 需要 blueprint 或设计审查 → Jump to Step 3
   │   └── 无 04_SYSTEM_DESIGN/ → 可能需要 design-system → Jump to Step 2
   │
   ├── 有 05_TASKS.md 但无 src/ 代码
   │   → 需要任务审查或开始执行 → Jump to Step 5
   │
   └── 有代码 + 有任务
       → 增量模式 → Jump to Step 7
```

### 状态报告

向用户展示：

```markdown
## 🧭 项目状态检测

**检测到的架构版本**: genesis/v{N} (或: 未找到 genesis 目录)
**PRD**: ✅ 存在 / ❌ 缺失
**Architecture**: ✅ 存在 / ❌ 缺失
**System Design**: ✅ 已有 {X} 个系统设计 / ⚠️ 未找到
**Tasks**: ✅ 共 {N} 个任务 ({M} 已完成) / ❌ 缺失
**代码**: ✅ src/ 存在 / ❌ 未开始

📍 **建议从 Step {X} 开始**: {原因}
```

⏸️ **等待用户确认** → 用户同意后按检测结果跳转到对应 Step。

---

## Step 1: 需求收集 (Genesis)

**目标**: 执行 `/genesis`，将模糊想法转化为 PRD + 架构文档 + ADR。

> 引导用户执行 `/genesis` 工作流。

### 完成后展示

```markdown
## ✅ Step 1 完成: 需求与架构

**产出文件**:
- 📄 genesis/v{N}/01_PRD.md — {X} 个 User Story, {Y} 个需求
- 📄 genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md — {Z} 个系统
- 📁 genesis/v{N}/03_ADR/ — {W} 个架构决策记录

**下一步**: Step 2 — 系统详细设计 (如需要) 或 Step 3 — 设计审查 (Challenge)
**预估**: Step 2 每个系统约 30-60 分钟; Step 3 约 15-30 分钟
```

⏸️ **等待用户确认** → 用户确认后进入 Step 2。

---

## Step 2: 系统设计 (Design System — 如需要)

**目标**: 评估是否需要为各系统执行 `/design-system`。

### 复杂度评估

检查 `02_ARCHITECTURE_OVERVIEW.md` 中的系统数量和复杂度：

| 条件                           | 判断         | 建议                                  |
| ------------------------------ | ------------ | ------------------------------------- |
| 系统数 ≤ 2，且无复杂跨系统交互 | 简单项目     | 建议跳过，blueprint 时可按需补充      |
| 系统数 ≥ 3，或有复杂状态同步   | 复杂项目     | 建议为每个核心系统执行 /design-system |
| 包含 AI/LLM 集成               | 需要详细设计 | 至少为 AI 相关系统做设计              |

### 展示评估结果

```markdown
## 🔍 Step 2: 系统设计评估

**架构中包含 {N} 个系统**:

| 系统       | 复杂度 | 建议                    |
| ---------- | :----: | ----------------------- |
| {system-1} |  🔴 高  | 建议执行 /design-system |
| {system-2} |  🟡 中  | 可选                    |
| {system-3} |  🟢 低  | 可跳过                  |

**建议**: 为 {system-1} 执行详细设计。其余可在 blueprint 阶段按需补充。
```

⏸️ **等待用户确认** → 用户选择要设计的系统 → 依次执行 `/design-system` → 全部完成后进入 Step 3。

---

## Step 3: 设计审查 (Challenge Design)

**目标**: 执行 `/challenge`，对当前的 PRD 和架构/系统设计进行系统性审查。

> 引导用户执行 `/challenge` 工作流。由于当前无 `05_TASKS.md`，系统会自动进入 `DESIGN` 模式。

### 完成后展示

```markdown
## ✅ Step 3 完成: 设计审查

**审查结果**:
| 级别       | 数量  |
| ---------- | :---: |
| 🔴 Critical |  {X}  |
| 🟠 High     |  {Y}  |
| 🟡 Medium   |  {Z}  |
| 🟢 Low      |  {W}  |

**详细报告**: genesis/v{N}/07_CHALLENGE_REPORT.md
```

### 判断逻辑

- **有 CRITICAL 问题**: "⚠️ 发现 {X} 个阻塞设计问题，建议先通过 /change 修复后再进入拆解环节。"
- **无 CRITICAL**: "✅ 无阻塞问题。可以开始拆解任务。"

```markdown
**下一步**: Step 4 — 任务拆解 (Blueprint)
```

⏸️ **等待用户确认** → 用户确认后进入 Step 4。

---

## Step 4: 任务拆解 (Blueprint)

**目标**: 执行 `/blueprint`，将稳固的架构拆解为可执行的 WBS 任务清单。

> 引导用户执行 `/blueprint` 工作流。含 User Story Overlay 交叉验证。

### 完成后展示

```markdown
## ✅ Step 4 完成: 任务清单

**产出文件**: genesis/v{N}/05_TASKS.md

**统计**:
- 总任务数: {N}
- P0 (Must): {X} | P1 (Should): {Y} | P2 (Nice): {Z}
- Sprint 数: {S}
- 总预估工时: {T}h

**User Story 覆盖**:
- {covered}/{total} US 完整覆盖
- {gaps} 个覆盖 GAP (已在 Overlay 中标注)

**下一步**: Step 5 — 任务审查 (Challenge Tasks，建议执行)
```

⏸️ **等待用户确认** → 用户确认后进入 Step 5。

---

## Step 5: 任务审查 (Challenge Tasks)

**目标**: 再次执行 `/challenge`，这次专注于任务清单的完备性与覆盖率。

> 引导用户执行 `/challenge` 工作流。由于 `05_TASKS.md` 已存在，它将执行 `task-reviewer` (或 `FULL` 全面审查)。

### 完成后展示

```markdown
## ✅ Step 5 完成: 任务审查

**审查结果**: (同上表)
**报告已追加至**: genesis/v{N}/07_CHALLENGE_REPORT.md
```

### 判断逻辑
- **有任务覆盖 GAP 或缺陷**: "⚠️ 任务清单有漏洞，建议使用 /change 补全。"
- **无阻塞问题**: "✅ 任务清单坚如磐石。"

```markdown
**下一步**: Step 6 — 开始编码执行 (Wave 1)
```

⏸️ **等待用户确认** → 用户确认后进入 Step 6。

---

## Step 6: 开始执行 (Forge)

**目标**: 引导进入 `/forge` 的第一个波次。

> 引导用户执行 `/forge` 工作流。

### 展示 Wave 1 建议

```markdown
## 🔨 Step 5: 准备开始执行

基于任务清单和依赖关系，建议 Wave 1 包含:

| 任务     | 标题 | 估时  |
| -------- | ---- | :---: |
| T{X.Y.Z} | ...  |  Xh   |
| T{X.Y.Z} | ...  |  Xh   |

**总估时**: ~{T}h

准备好了吗？确认后将进入 /forge 开始编码。
此后可直接使用 /forge 继续后续波次。
```

⏸️ **等待用户确认** → 确认后执行 `/forge`。

---

## Step 7: 增量模式 (Incremental)

**目标**: 项目已有进度时，展示当前状态并建议下一步。

### 展示当前进度

```markdown
## 📊 项目进度

**架构版本**: genesis/v{N}
**任务进度**: {completed}/{total} ({percentage}%)
**当前波次**: Wave {W} ({status})

| Sprint | 任务数 | 已完成 | 状态  |
| ------ | :----: | :----: | :---: |
| S1     |  {X}   |  {Y}   | ✅/🔶/⬜ |
| S2     |  {X}   |  {Y}   | ✅/🔶/⬜ |

**建议下一步**:
1. `/forge` — 继续执行未完成的任务
2. `/change` — 微调已有任务
3. `/challenge` — 对当前状态做一次审查
4. `/genesis` — 启动新版本架构 (v{N+1})
```

⏸️ **等待用户选择** → 根据选择跳转到对应工作流。

---

<completion_criteria>
- ✅ 正确检测了项目状态
- ✅ 每个 Step 结束后等待了用户确认
- ✅ 用户已进入具体工作流开始工作
</completion_criteria>

---

## 🔀 Handoffs

完成本工作流后，根据情况选择：

- **从头开始** → `/genesis` — 从零开始，将想法转化为 PRD 和架构
- **任务拆解** → `/blueprint` — 将架构拆解为可执行任务
- **开始编码** → `/forge` — 按任务清单开始波次执行
- **质疑设计** → `/challenge` — 对当前设计进行系统性挑战
