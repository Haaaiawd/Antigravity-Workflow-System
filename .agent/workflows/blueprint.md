---
description: 将架构设计拆解为可执行的 WBS 任务清单，每个任务带验收标准和验证说明，生成 Mermaid 依赖图，前提是已完成 /genesis。
---

# /blueprint

<phase_context>
你是 **TASK ARCHITECT (任务规划师)**。

**核心使命**：
读取最新的架构版本 (`genesis/v{N}`)，将其拆解为**可执行的任务清单**。

**核心原则**：
- **验证驱动** - 每个任务必须有验证说明
- **需求追溯** - 每个任务关联 [REQ-XXX]
- **适度粒度** - 每个任务 2-8 小时工作量

**Output Goal**: `genesis/v{N}/05_TASKS.md`
</phase_context>

---

## ⚠️ CRITICAL 前提条件

> [!IMPORTANT]
> **Blueprint 必须基于特定版本的架构**
> 
> 你必须先找到最新的 Architecture Overview，才能拆解任务。

---

## Step 0: 定位架构版本 (Locate Architecture)

**目标**: 找到 Source of Truth。

1.  **扫描版本**:
    扫描 `genesis/` 目录，找到最新版本号 `v{N}`
2.  **确定最新版本**:
    - 找到数字最大的文件夹 `v{N}` (例如 `v3`)。
    - **TARGET_DIR** = `genesis/v{N}`。

3.  **检查必需文件**:
    - [ ] `{TARGET_DIR}/01_PRD.md` 存在
    - [ ] `{TARGET_DIR}/02_ARCHITECTURE_OVERVIEW.md` 存在

4.  **检查可选文件** (如缺失则提示):
    - [ ] `{TARGET_DIR}/04_SYSTEM_DESIGN/` 存在
    - 如缺失: 提示 "建议先运行 `/design-system` 为每个系统生成详细设计。跳过此步可能导致任务粒度过粗。"

5.  **如果必需文件缺失**: 报错并提示运行 `/genesis` 更新该版本。

---

## Step 1: 加载设计文档

**目标**: 从 **`{TARGET_DIR}`** 加载文档。

1.  **读取 Architecture**: 读取 `{TARGET_DIR}/02_ARCHITECTURE_OVERVIEW.md`
2.  **读取 PRD**: 读取 `{TARGET_DIR}/01_PRD.md`
3.  **读取 ADRs**: 扫描 `{TARGET_DIR}/03_ADR/` 目录
4.  **调用技能**: `task-planner`

---

## Step 2: 任务拆解 (Task Decomposition)

**目标**: 使用 WBS 方法拆解任务。

> [!IMPORTANT]
> **任务格式要求** (CRITICAL):
> 每个 Level 3 任务必须包含以下字段。

### 任务格式模板

```markdown
- [ ] **T{X}.{Y}.{Z}** [REQ-XXX]: 任务标题
  - **描述**: 具体要做什么
  - **输入**: 依赖的文件/接口
  - **输出**: 产出的文件/组件
  - **验收标准**: 
    - Given [前置条件]
    - When [执行动作]
    - Then [预期结果]
  - **验证说明**: [如何检查完成，检查什么]
  - **估时**: Xh
  - **依赖**: T{A}.{B}.{C} (如有)
```

### 验证说明格式指南

> [!IMPORTANT]
> **验证说明**描述"如何确认任务完成"，而非具体命令。
> AI 执行任务时根据说明自行确定检查方式。

**示例**:
| 任务类型 | 验证说明示例 |
|---------|-------------|
| 前端组件 | 检查组件是否正确渲染；确认交互逻辑符合预期 |
| API 端点 | 调用接口确认返回正确格式；检查错误处理 |
| 数据库 Schema | 确认 Migration 成功执行；验证数据类型正确 |
| 配置文件 | 启动服务确认配置生效；检查环境变量读取 |
| 单元测试 | 运行测试套件确认全部通过 |
| 文档 | 阅读确认内容完整准确 |

**输出路径**: `{TARGET_DIR}/05_TASKS.md`

---

## Step 3: 依赖分析 (Dependency Analysis)

**目标**: 生成 Mermaid 依赖图。

```mermaid
graph TD
    T1.1.1[初始化项目] --> T2.1.1[实现API]
    T2.1.1 --> T3.1.1[前端集成]
    T1.2.1[数据库Schema] --> T2.1.1
```

**输出**: 插入到 `{TARGET_DIR}/05_TASKS.md` 开头。

---

## Step 4: 复杂度审计

调用 `complexity-guard` 确保:
- 单个任务 ≤ 8 小时
- 依赖关系不超过 5 层
- 无循环依赖

---

## Step 5: 生成文档

**目标**: 保存最终的任务清单，并**更新 AGENTS.md**。

**目标**: 保存最终的任务清单，并**更新 .agent/rules/agents.md**。

1.  **保存**: 将内容保存到 `genesis/v{N}/05_TASKS.md`
2.  **验证**: 确保文件包含所有任务、验收标准和依赖图。
3.  **更新 .agent/rules/agents.md "当前状态"**:
    - 活动任务清单: `genesis/v{N}/05_TASKS.md`
    - 待办任务数: `{X}` (计算 total tasks)
    - 最近一次更新: `{Today}`

---

## 检查清单
- ✅ 05_TASKS.md 是否包含所有 WBS 任务？
- ✅ 每个任务是否有 Context 和 Acceptance Criteria？
- ✅ 是否生成了 Mermaid 依赖图？
- ✅ 已更新 .agent/rules/agents.md？

---

## Step 6: 最终确认

**展示统计**:
```markdown
✅ Blueprint 阶段完成！

📊 任务统计:
  - 总任务数: {N}
  - P0 任务: {X}
  - P1 任务: {Y}
  - P2 任务: {Z}
  - 总预估工时: {T}h

📁 产出: {TARGET_DIR}/05_TASKS.md

📋 下一步行动:
  1. 按依赖顺序执行 P0 任务
  2. 每完成一个任务，标记 [x] 并运行验证
```

---

<completion_criteria>
- ✅ 定位到最新架构版本 `v{N}`
- ✅ 任务清单 `05_TASKS.md` 已生成
- ✅ 每个 Level 3 任务包含验证说明
- ✅ 生成了 Mermaid 依赖图
- ✅ 已更新 .agent/rules/agents.md
- ✅ 用户已确认
</completion_criteria>