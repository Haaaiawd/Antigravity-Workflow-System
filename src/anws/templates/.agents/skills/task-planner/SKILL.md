---

name: task-planner
description: 使用 WBS 将系统设计文档分解为执行主清单（05A_TASKS.md）与验证计划（05B_VERIFICATION_PLAN.md），支持依赖分析、验证追溯与证据定义。

# Task Planner

你是任务拆解与验证编排技能，目标是输出两份文档：

- `.anws/v{N}/05A_TASKS.md`（执行主清单）
- `.anws/v{N}/05B_VERIFICATION_PLAN.md`（验证计划）

---

## 快速流程

1. 读取 `01_PRD.md`、`02_ARCHITECTURE_OVERVIEW.md`
2. 读取 `03_ADR/` 与 `04_SYSTEM_DESIGN/`（如存在）
3. 若 ADR 中存在测试策略/质量门禁，必须优先遵循，不得自行改重
4. 提取公共契约（HTTP API / CLI / 配置 / 错误语义 / 数据结构等）
5. 生成 WBS 任务（System → Phase → Task）到 `05A`
6. 为每个任务生成验证锚点与证据要求到 `05B`

---

## 分轨职责

### 05A_TASKS.md（执行主清单）

- WBS 任务列表与依赖
- Sprint 路线图
- INT 里程碑任务
- 进度 checkbox
- User Story Overlay

### 05B_VERIFICATION_PLAN.md（验证计划）

- 验证分层策略
- 风险类别覆盖规则
- Task-by-Task 验证计划
- Contract Coverage Overlay
- Testing Coverage Overlay
- Verification Traceability Matrix

> [!IMPORTANT]
> 上述三项为 05B 的硬性必选章节，不可删除：
>
> - Contract Coverage Overlay
> - Testing Coverage Overlay
> - Verification Traceability Matrix

---

## 任务格式（05A）

```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: 任务标题
  - **描述**: 做什么（不是怎么做）
  - **输入**: 设计文档引用 + 前置任务产出（必须包含至少一个文档引用）
  - **输出**: 产出的文件/组件/接口
  - **契约承接**: 本任务实现或验证的公共契约；如无则写"无"
  - **参考**: ADR-XXX 或 System Design 章节（如有）
  - **验收标准**:
    - Given [前置条件]
    - When [执行动作]
    - Then [预期结果]
    - （仅纯技术性基础任务允许使用清晰 Done When 列表）
  - **验证类型**: 单元测试 | API接口功能测试 | 集成测试 | E2E测试 | 冒烟测试 | 回归测试 | 手动验证 | 编译检查 | Lint检查
  - **验证摘要**: 验证目标与边界（不展开完整用例）
  - **验证引用**: `05B_VERIFICATION_PLAN.md#t-x-y-z`
  - **证据产出**: `tests/...`, `reports/...`, `screenshots/...`, `logs/...`
  - **估时**: Xh
  - **依赖**: T{A}.{B}.{C}
  - **优先级**: P0 | P1 | P2
```

---

## 验证格式（05B）

### Task-by-Task 条目

```markdown
### T{X}.{Y}.{Z}
- 关联需求:
- 关联契约:
- 风险类别:
- 单元测试覆盖:
- API接口功能测试覆盖:
- 集成/E2E/冒烟覆盖:
- 前置数据:
- 断言:
- 证据:
```

### 追溯矩阵

```markdown
## Verification Traceability Matrix
| REQ/Contract | Task | Verification | Test Material | Evidence | Status |
|---|---|---|---|---|---|
```

---

## 验证类型选择逻辑

按"最轻但足够"原则：

1. 局部逻辑 / 纯算法 / 状态转换 / 异常处理 → 单元测试
2. HTTP API / CLI API / 权限边界 / 错误语义 / 数据变更接口 → API接口功能测试
3. 跨模块 / 数据库 / 多服务协作 → 集成测试
4. 直接面向终端用户的关键路径 → E2E测试 或 手动验证
5. Sprint 退出关口 / 里程碑 gate → 冒烟测试（优先绑定 `INT-S{N}`）
6. 修改可能影响已完成关键能力 → 回归测试
7. 配置/脚手架/基础设施 → 编译检查 / Lint检查 / 手动验证

**选择细则**：

- 不要因为任务"看起来重要"就默认选择 E2E测试
- 任务暴露或修改对外 API → 必须明确正常请求/代表性异常请求/错误语义如何验证
- 涉及数据变更接口 → 验证说明必须包含 before/after 断言
- 涉及鉴权/角色/权限边界 → 验证说明必须包含权限不足场景

### E2E 执行边界（强约束）

- `task-planner` 只负责在 `05A_TASKS.md` / `05B_VERIFICATION_PLAN.md` 记录 E2E 触发设想、覆盖范围和证据预期
- 规划阶段不得调用或执行 `e2e-testing-guide`
- 实际 E2E 指南生成与实机验证由 `/forge` 根据任务触发执行

---

## 测试标准（硬约束）

> [!IMPORTANT]
> **项目验收必须同时包含单元测试与 API 接口功能测试。**

### 单元测试内容要求

- **核心业务计算逻辑**: 正常输入、边界输入、非法输入，验证处理结果符合预期
- **关键状态转换逻辑**: 创建、执行、失败、重试等状态分别规划用例
- **异常处理逻辑**: 构造空值、超范围参数、非法状态，验证错误信息正确且系统稳定

### API接口功能测试内容要求

- **核心业务接口**: 正常请求参数下返回正确响应
- **异常请求场景**: 参数缺失、参数格式错误、权限不足，验证错误码和错误信息符合接口设计规范
- **数据变更接口**: 验证调用前后系统状态或数据结果正确（before/after 断言）

### 反测试膨胀原则

- 目标是**风险类别闭合**，不是测试数量最大化
- 优先等价类划分、边界值、代表性错误样本、参数化测试或表驱动测试
- 禁止全组合笛卡尔积枚举
- 单元测试负责细粒度逻辑，API接口功能测试负责对外契约，E2E 只保留关键用户链路

---

## 契约覆盖规则

> [!IMPORTANT]
> **若任务产出包含或修改公共契约，必须为其分配明确验证承接。**

公共契约至少包括：操作契约、跨系统接口、HTTP API、CLI 命令/参数语义、配置结构、文件格式、错误语义、持久化结构。

规则：

- 每个公共契约至少有一个实现任务承接
- 每个高风险公共契约至少有一个验证承接点
- 不得仅以"实现任务有代码变更"视为契约闭合
- 基础规则层/低依赖纯逻辑 → 优先单元测试
- HTTP API / CLI API / 对外接口 → 优先 API接口功能测试
- 错误码/错误信息/权限不足语义/数据变更前后状态 → 属于可观察契约，不得遗漏

---

## WBS 方法

### 三级层次

```
Level 1: System（系统级）  ← 来自 Architecture Overview 的系统清单
Level 2: Phase（阶段级）   ← Foundation / Core / Integration / Polish
Level 3: Task（任务级）    ← 2h–2d 粒度的具体任务
```

### Sprint 路线图格式

```markdown
## Sprint 路线图

| Sprint | 代号 | 核心任务 | 退出标准 | 预估 |
|--------|------|---------|---------|------|
| S1     | Hello World | 基础设施 + 核心数据 | headless 运行通过 + 基本渲染可见 | 3-4d |
```

退出标准要求：

- 可客观验证（截图/录屏/日志）
- 描述用户或开发者能观察到的行为
- 涵盖跨系统集成

### 集成验证任务 (INT-S{N})

```markdown
- [ ] **INT-S{N}** [MILESTONE]: S{N} 集成验证 — {代号}
  - **描述**: 验证 S{N} 退出标准
  - **输入**: S{N} 所有任务的产出
  - **输出**: 集成验证报告（通过/失败 + Bug 清单）
  - **验收标准**:
    - Given S{N} 所有任务已完成
    - When 逐条执行退出标准中的检查
    - Then 全部通过 → Sprint 完成; 有失败 → 记录 Bug
  - **验证说明**: 按退出标准逐条执行，截图/录屏/日志确认
  - **估时**: 2-4h
  - **依赖**: S{N} 最后一个任务
```

INT 任务是该 Sprint 的"关门任务"。**未通过 INT 任务的 Sprint 不得标记为完成。**

---

## 任务质量守则

### 粒度

- 单个 Task 优先落在 2h–2d；超过 2d 应继续拆分
- 太小（< 2h）考虑合并

### 输入/输出追溯

> [!IMPORTANT]
> **任务间的输入/输出必须对齐。**
>
> 如果 Task B 依赖 Task A，则 B 的「输入」必须明确引用 A 的「输出」的具体产物（文件路径、接口名、数据格式）。

### 验收标准

- 默认使用 Given / When / Then
- 仅纯技术性基础任务（配置、脚手架）允许清晰 Done When 列表

---

## 输出质量检查

- `05A` 与 `05B` 已同时生成
- 每个 05A 任务都包含 `验证引用` 与 `证据产出`
- `05B` 含 Task-by-Task 计划与追溯矩阵
- User Story Overlay 在 `05A`
- Contract Coverage Overlay、Testing Coverage Overlay、Verification Traceability Matrix 在 `05B`
- 冒烟测试优先绑定 `INT-S{N}`，未扩散到普通开发任务
- 未出现 E2E 测试滥用现象

