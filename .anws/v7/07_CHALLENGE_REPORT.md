# 挑战报告 (Challenge Report)

> **审查对象**: Workflow-Skill 集成闭环与测试策略  
> **审查版本**: .anws/v7  
> **审查日期**: 2026-03-30  
> **审查方法**: Pre-Mortem + 三维框架 (系统设计、运行模拟、工程实现)

---

## 📊 执行摘要

本次挑战审查针对 4 个修改后的 workflows (`genesis`, `explore`, `blueprint`, `change`) 及其与 skills 的集成闭环，重点验证：
1. 条件 `/explore` 触发逻辑的完整性
2. `find-skills` 可选集成的 fallback 机制
3. `blueprint` 测试分层标准的可执行性
4. `/change` 权限边界的执行保障

**整体健康度**: 🟡 **需关注** (2 CRITICAL, 5 HIGH, 8 MEDIUM)

---

## 🔴 Pre-Mortem 分析

### 失败场景模拟

**假设**: 6 个月后，用户在实际项目中报告"workflow 无法完成任务"。倒推根因：

#### 失败模式 1: `find-skills` 缺失导致 `/explore` 阻塞
**症状**: 用户运行 `/genesis` → Step 2.5 触发 `/explore` → `/explore` 内部尝试调用 `find-skills` → 环境中无此 skill → workflow 卡住

**根因**:
- `genesis.md:171` 写"可在 `/explore` 中按需使用 `find-skills`"，但未明确"无 `find-skills` 时的完整执行路径"
- `explore.md:67` 将 `find-skills` 列在搜索技巧表格中，但**未在执行步骤中显式写明"检测 skill 可用性 → 跳过或降级"的逻辑**
- Workflow 执行者（AI）可能理解为"`find-skills` 是表格中的一个选项，应该调用"，而非"这是一个可选增强"

**证据**:
```markdown
@genesis.md:171
如问题涉及方法论、专业框架、测试策略或设计启发，可在 `/explore` 中按需使用 `find-skills`
如果运行环境中没有可用的 `find-skills`，则直接退化为普通搜索与结构化调研，不得阻塞 workflow
```
→ 这段文字在 `genesis.md` 中，但 `explore.md` 内部**没有对应的判断逻辑**

```markdown
@explore.md:67-75
**搜索技巧**:
| 目标 | 技巧 | 示例 |
| **find-skills** | `find-skills` | "find-skills Rust async" |
```
→ 表格中列出了 `find-skills`，但后续步骤 `2.1.1 → 2.1.N` 中**没有写"如何处理 skill 不存在"**

**严重度**: 🔴 **CRITICAL**

**建议**:
在 `explore.md` 的 **Step 2.1** 开头增加：
```markdown
> [!IMPORTANT]
> **Skill 可用性检测**:
> 1. 如果当前环境支持 `find-skills`，可在 **Step 2.1.X** 中将其作为搜索源之一
> 2. 如不可用，直接使用 `search_web`、`read_url_content` 等标准工具
> 3. **不得因 skill 不可用而中断 workflow**
```

---

#### 失败模式 2: `blueprint` 测试类型指导与实际生成脱节
**症状**: 用户运行 `/blueprint` → 生成的 `05_TASKS.md` 中 80% 任务都标记为"E2E测试" → 用户反馈"测试过重，执行成本过高"

**根因**:
- `blueprint.md:99-112` 定义了"测试分层标准"和"生成原则"，但**这些原则是给 AI 的指导，不是强制约束**
- `task-planner` skill 内部**没有读取这些原则的机制** → task-planner 仍按旧逻辑生成
- Workflow 调用 `task-planner` 时，**未显式传递"测试分层约束"作为参数**

**证据**:
```markdown
@blueprint.md:121-143
### 测试分层标准
- 优先为每项任务选择**最轻但足够**的验证类型
- 不要把回归测试和冒烟测试泛化为每个任务的默认要求
```
→ 这是 workflow 文档中的指导，但 `task-planner` skill **未在其内部逻辑中读取此段**

```markdown
@task-planner/SKILL.md:85-121
### 任务格式模板
- **验证类型**: [单元测试 | 集成测试 | E2E测试 | 冒烟测试 | 回归测试 | 手动验证 | 编译检查 | Lint检查]
```
→ Skill 定义了验证类型，但**没有"如何选择验证类型"的决策逻辑**

**严重度**: 🟠 **HIGH**

**建议**:
1. 在 `blueprint.md` 调用 `task-planner` 的步骤中，**显式要求**传递测试分层约束
2. 或在 `task-planner` skill 的 `⚡ 快速开始` 中增加：
   ```markdown
   6. **应用测试分层原则**: 读取 Blueprint workflow 中的测试分层标准，按原则为每个任务选择验证类型
   ```

---

#### 失败模式 3: 冒烟测试的"稀疏放置"被忽略
**症状**: 用户生成的 `05_TASKS.md` 中，每个 Sprint 都有 10+ 个冒烟测试任务 → 执行成本激增

**根因**:
- `blueprint.md:162-176` 定义了"冒烟测试应当少而真实，主要用于里程碑门控"
- 但 **`task-planner` skill 无法感知"Sprint 边界"和"里程碑任务"** → 无法识别哪些任务应该打上冒烟测试标记
- Workflow 未显式在 **Step 4: Sprint 路线图** 和 **Step 5: 拆解任务** 之间建立"将冒烟测试绑定到 `INT-S{N}` 任务"的逻辑

**证据**:
```markdown
@blueprint.md:162-176
### 冒烟测试使用原则
- 默认每个 Sprint 只在 `INT-S{N}` 或极少数里程碑任务上要求冒烟验证
```
→ 这是原则，但未在执行步骤中落实

```markdown
@blueprint.md:246-261
## Step 5: 拆解任务 (Task Breakdown)
1. **调用技能**: `task-planner`
```
→ 调用 skill 时，**未传递"Sprint 边界"和"冒烟测试绑定规则"**

**严重度**: 🟠 **HIGH**

**建议**:
在 `blueprint.md` Step 5 中增加显式指令：
```markdown
5. **调用技能**: `task-planner`
   - 传递 Sprint 路线图
   - **明确要求**: 冒烟测试**仅**放置在 `INT-S{N}` 集成验证任务上
   - 其他任务优先选择单元测试/集成测试/手动验证
```

---

#### 失败模式 4: `/change` 的权限边界在运行时无法强制执行
**症状**: 用户运行 `/change` 并要求"添加一个新功能" → AI 判断"这属于受控扩展，可以处理" → 实际执行时创建了新文件 → 违反了权限约束

**根因**:
- `change.md:27-51` 定义了严格的权限表，禁止"创建新文件"
- 但这是**文档约束，不是代码约束** → AI 需要在执行每一步时**主动检查**是否违反权限
- Workflow 未在 **Step 4: 执行变更** 前插入**强制检查点** → 例如"变更计划是否包含被禁止的操作？"

**证据**:
```markdown
@change.md:27-51
| 能力 | 允许 | 禁止 |
| **创建新文件** | | ❌ |
```
→ 表格清晰，但**执行步骤中无对应检查**

```markdown
@change.md:231-279
## Step 4: 执行变更 (Execute Changes)
1. **逐项应用**: 按变更计划逐项修改
```
→ 未要求"检查每项操作是否在权限表内"

**严重度**: 🟠 **HIGH**

**建议**:
在 Step 4 之前插入：
```markdown
## Step 3.5: 权限合规检查
1. **遍历变更计划**: 检查每项操作
2. **对照权限表**: 确认无禁止操作（创建新文件、修改 PRD、修改 ADR 等）
3. **若检测到违规**: 向用户报告 → 引导运行 `/genesis`
4. **若全部合规**: 继续 Step 4
```

---

## 🔍 三维审查框架

### 维度 1: 系统设计 (System Design)

#### SD-1: Skill 依赖声明不完整
**位置**: `genesis.md:162-200`, `explore.md:67-88`, `blueprint.md:246-261`

**问题**:
Workflows 在文档中**提到** skills，但未明确"Skill 是否必须存在"和"不存在时的 fallback 路径"

**证据**:
- `genesis` 调用 `concept-modeler`, `spec-writer`, `tech-evaluator`, `system-architect` → 未说明"如果 skill 不存在怎么办"
- `blueprint` 调用 `task-planner` → 未说明"如果 skill 不存在怎么办"
- `explore` 提到 `find-skills` → 在 `genesis` 中说了 fallback，但 `explore` 内部未实现

**影响**:
如果用户环境中缺少某个 skill，workflow 会因"找不到 skill"而中断

**严重度**: 🟠 **HIGH**

**建议**:
在每个 workflow 的开头增加 **Skill 依赖清单**：
```markdown
## ⚙️ Skill 依赖
| Skill | 必需/可选 | 缺失时行为 |
|-------|:--------:|----------|
| concept-modeler | 必需 | 报错退出，提示用户安装 |
| find-skills | 可选 | 降级为普通搜索，继续执行 |
```

---

#### SD-2: 测试策略从 `genesis` 到 `blueprint` 的传递链断裂
**位置**: `genesis.md:193-200`, `blueprint.md:99-143`

**问题**:
- `genesis` Step 3 要求"评估测试策略层级及质量门禁"
- `genesis` Step 5 可将测试策略决策记录到 ADR
- **但 `blueprint` 调用 `task-planner` 时，未显式读取这些 ADR 中的测试约束**

**证据**:
```markdown
@genesis.md:193-200
## Step 3: 技术选型
- 评估与该项目类型匹配的测试策略与质量门禁
```
```markdown
@genesis.md:248-251
## Step 5: 架构决策
4. **如测试策略属于跨系统约束**: 记录测试分层、冒烟/回归门禁、关键验证时机等决策
```
→ ADR 中可能记录了测试策略

```markdown
@blueprint.md:246-261
## Step 5: 拆解任务
1. **调用技能**: `task-planner`
```
→ 未要求 `task-planner` 读取 ADR 中的测试策略

**影响**:
即使 `genesis` 决定了"本项目只需单元测试 + 最小集成测试"，`blueprint` 仍可能生成大量 E2E 测试任务

**严重度**: 🟡 **MEDIUM**

**建议**:
在 `blueprint.md` Step 2 或 Step 5 中增加：
```markdown
2. **加载测试策略约束**: 如 `.anws/v{N}/03_ADR/` 中存在测试策略相关 ADR，读取并传递给 `task-planner`
```

---

### 维度 2: 运行模拟 (Runtime Simulation)

#### RS-1: 条件触发的 `/explore` 可能被跳过或误触发
**位置**: `genesis.md:162-172`

**问题**:
`genesis` Step 2.5 列出了 6 个触发条件，但**判断逻辑完全依赖 AI 的主观理解**

**模拟场景**:
1. 用户提供 PRD："构建一个高性能 Web 应用，响应时间要快"
2. AI 执行 `genesis` Step 2.5，判断是否触发 `/explore`
3. **情况 A**: AI 认为"快"是常见需求，不触发 `/explore` → 跳过调研 → Step 3 技术选型时缺少外部证据
4. **情况 B**: AI 认为"需要先明确测试策略"，触发 `/explore` → 但 `explore` 内没有"测试策略调研"的专项指导 → 产出泛化报告

**证据**:
```markdown
@genesis.md:165-172
**满足任一条件时，应插入 `/explore`**:
- 需要先明确测试策略、质量门禁或验证分层，再决定架构和任务模板
```
→ "需要先明确"是主观判断，无客观标准

**严重度**: 🟡 **MEDIUM**

**建议**:
在 `genesis.md` Step 2.5 增加**具体化触发条件**：
```markdown
**客观触发条件**（满足任一即触发）:
1. PRD 中包含未量化的性能形容词（快、可扩展、健壮）
2. PRD 中提及对标产品或行业实践
3. ADR 需要外部案例支撑（如"选择 X 框架的依据"）
4. PRD 中明确要求测试覆盖率 >80% 或特定测试类型
```

---

#### RS-2: `find-skills` 降级路径未经过实际测试
**位置**: `genesis.md:171`, `explore.md:67-88`

**问题**:
文档声称"无 `find-skills` 时退化为普通搜索"，但**未定义"普通搜索"的具体执行步骤**

**模拟场景**:
1. 用户环境中无 `find-skills`
2. AI 执行 `/explore` → 按 `explore.md` Step 2.1 搜索
3. 搜索技巧表格中列出了 `find-skills` → AI 尝试调用 → **失败**
4. AI 需要自行判断"改用什么工具" → 可能选择 `search_web` + `read_url_content`
5. **但这条路径从未在文档中显式写明** → AI 可能误判为"workflow 不完整"

**证据**:
```markdown
@explore.md:67-75
| **find-skills** | `find-skills` | "find-skills Rust async" |
```
→ 表格中列出，但后续步骤未说明"如果无法调用，改用 XXX"

**严重度**: 🟡 **MEDIUM**

**建议**:
在 `explore.md` Step 2.1 中增加：
```markdown
**备用搜索路径**（当 `find-skills` 不可用时）:
1. 使用 `search_web` 搜索方法论关键词（如 "testing pyramid best practices"）
2. 使用 `read_url_content` 读取高质量文档（如 Martin Fowler 博客、官方文档）
3. 在报告中标注"未使用 skill 增强"
```

---

### 维度 3: 工程实现 (Engineering Implementation)

#### EI-1: `blueprint` 的测试生成矩阵缺少默认值
**位置**: `blueprint.md:99-143`

**问题**:
`blueprint.md` 定义了"何时生成何种测试"的原则，但**未提供默认决策树**

**模拟场景**:
1. AI 拆解任务 T2.3.5："实现用户登录接口"
2. 查阅 `blueprint.md:114-120` 验证类型选择指南：
   ```markdown
   - 纯逻辑/算法任务 → 单元测试
   - 跨模块/跨系统任务 → 集成测试
   - 用户交互/前端任务 → E2E测试 或 手动验证
   ```
3. AI 判断："登录接口"既是跨系统（frontend ↔ backend），也涉及用户交互
4. **无明确指引：应选择"集成测试"还是"E2E测试"？**
5. AI 可能默认选择"E2E测试"（更保险） → 测试过重

**证据**:
```markdown
@blueprint.md:114-120
**验证类型选择指南**：
- 用户交互/前端任务 → E2E测试 或 手动验证
```
→ "或" 表示可选，但未说明选择标准

**严重度**: 🟡 **MEDIUM**

**建议**:
在 `blueprint.md` 增加**决策树**：
```markdown
### 验证类型决策树

**Step 1**: 任务是否涉及数据库？
- 否 → 单元测试
- 是 → Step 2

**Step 2**: 任务是否跨越多个系统？
- 否 → 集成测试
- 是 → Step 3

**Step 3**: 任务是否直接面向终端用户？
- 是 → E2E测试（关键路径）或 集成测试（次要路径）
- 否 → 集成测试
```

---

#### EI-2: `/change` 的"受控扩展"边界模糊
**位置**: `change.md:53-104`

**问题**:
`change.md` 定义了"局部修订"和"受控扩展"，但**两者的边界依赖 7 个问题的主观判断**

**模拟场景**:
1. 用户请求："在登录页面增加'忘记密码'链接"
2. AI 执行 `/change` → 运行 7 问题影响评估
3. 问题 5："是否需要新增任务？" → AI 判断："需要新增 T1.2.6 实现忘记密码功能"
4. 根据 `change.md:91-104`，"需要新增任务"可能属于"受控扩展"（允许补充少量必要任务）
5. **但"少量"的定义是什么？3 个？5 个？10 个？**
6. AI 可能生成 10 个任务（前端组件 + 后端接口 + 邮件服务 + 数据库表） → 实际上已经是架构演进

**证据**:
```markdown
@change.md:42-43
| 为承接已明确请求的局部修订而补充少量必要任务 | ✅ | |
```
→ "少量"未量化

```markdown
@change.md:91-104
**受控扩展 (Controlled Expansion)**:
- 变更影响 ≤ 3 个系统
- 需要新增任务，但不超过当前 Sprint 容量的 20%
```
→ "20%" 是好的约束，但**未在权限表中体现**

**严重度**: 🟡 **MEDIUM**

**建议**:
在 `change.md` 权限表中增加量化约束：
```markdown
| 为承接已明确请求的局部修订而补充少量必要任务（≤ 当前 Sprint 容量 20%） | ✅ | |
| 新增任务超过 Sprint 容量 20% | | ❌ → 引导 `/genesis` |
```

---

## 📋 发现汇总

| ID | 严重度 | 维度 | 发现 | 建议 |
|----|:------:|:----:|------|------|
| CH-01 | 🔴 CRITICAL | Pre-Mortem | `find-skills` 缺失导致 `/explore` 阻塞 | `explore.md` Step 2.1 增加 skill 可用性检测逻辑 |
| CH-02 | 🔴 CRITICAL | Pre-Mortem | `blueprint` 测试类型指导与 `task-planner` 脱节 | `blueprint.md` 显式传递测试分层约束给 `task-planner` |
| CH-03 | 🟠 HIGH | Pre-Mortem | 冒烟测试的"稀疏放置"被忽略 | `blueprint.md` Step 5 明确冒烟测试仅绑定到 `INT-S{N}` |
| CH-04 | 🟠 HIGH | Pre-Mortem | `/change` 权限边界无运行时强制检查 | `change.md` Step 4 前插入权限合规检查 |
| CH-05 | 🟠 HIGH | SD | Skill 依赖声明不完整 | 所有 workflows 增加 Skill 依赖清单表格 |
| CH-06 | 🟡 MEDIUM | SD | 测试策略从 `genesis` 到 `blueprint` 传递链断裂 | `blueprint.md` 增加"加载测试策略约束"步骤 |
| CH-07 | 🟡 MEDIUM | RS | 条件触发的 `/explore` 判断标准主观 | `genesis.md` Step 2.5 增加客观触发条件 |
| CH-08 | 🟡 MEDIUM | RS | `find-skills` 降级路径未显式定义 | `explore.md` Step 2.1 增加备用搜索路径 |
| CH-09 | 🟡 MEDIUM | EI | `blueprint` 测试生成矩阵缺少决策树 | `blueprint.md` 增加验证类型决策树 |
| CH-10 | 🟡 MEDIUM | EI | `/change` 的"受控扩展"边界模糊 | `change.md` 权限表增加量化约束（20% 上限） |
| CH-11 | 🟢 LOW | EI | `blueprint.md` 回归测试使用原则未在 `task-planner` 中体现 | `task-planner` skill 增加回归测试生成指导 |
| CH-12 | 🟢 LOW | SD | `genesis.md` ADR 输出格式与 `tech-evaluator` 模板可能不一致 | 交叉验证 ADR 模板 |
| CH-13 | 🟢 LOW | RS | `explore.md` Skill Harvesting 原则未在输出报告格式中体现 | `explore.md` 增加"如何标注 skill 来源"的示例 |
| CH-14 | 🟢 LOW | EI | `task-planner` 的 Sprint 路线图格式与 `blueprint` 略有差异 | 统一 Sprint 表格格式 |
| CH-15 | 🟢 LOW | EI | `change.md` CHANGELOG 更新格式未明确 | 增加 CHANGELOG 条目示例 |

**统计**: CRITICAL: 2, HIGH: 3, MEDIUM: 5, LOW: 5

---

## ✅ 闭环完整性验证

### Workflow → Skill 调用链

| Workflow | Step | 调用 Skill | Skill 存在? | Fallback 定义? | 状态 |
|----------|------|-----------|:----------:|:-------------:|:----:|
| genesis | 1 | concept-modeler | ✅ | ❌ | ⚠️ 需补充 fallback |
| genesis | 2 | spec-writer | ✅ | ❌ | ⚠️ 需补充 fallback |
| genesis | 2.5 | explore (可选) | ✅ (workflow) | ✅ | ✅ |
| genesis | 3 | tech-evaluator | ✅ | ❌ | ⚠️ 需补充 fallback |
| genesis | 4 | system-architect | ✅ | ❌ | ⚠️ 需补充 fallback |
| explore | 2.1 | find-skills (可选) | ❌ | ⚠️ 部分 | ⚠️ 需完善降级路径 |
| blueprint | 5 | task-planner | ✅ | ❌ | ⚠️ 需补充 fallback |
| challenge | Pre-Mortem | sequential-thinking | ✅ | — | ✅ |
| challenge | 维度审查 | design-reviewer | ✅ | — | ✅ |
| challenge | 维度审查 | task-reviewer | ✅ | — | ✅ |

**发现**: 
- `find-skills` skill 文件不存在，但 workflows 中将其定义为可选 → 需确认是否应创建占位 skill
- 核心 skills (concept-modeler, spec-writer, tech-evaluator, system-architect, task-planner) 都存在，但 workflows 未定义"skill 不存在时"的 fallback

---

### Skill → Output 文档链

| Skill | 产出文档 | 被读取方 | 状态 |
|-------|---------|---------|:----:|
| concept-modeler | `.anws/v{N}/concept_model.json` | spec-writer | ✅ |
| spec-writer | `.anws/v{N}/01_PRD.md` | tech-evaluator, system-architect, task-planner | ✅ |
| tech-evaluator | `.anws/v{N}/03_ADR/ADR_001_TECH_STACK.md` | system-architect, task-planner | ✅ |
| system-architect | `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` | system-designer, task-planner | ✅ |
| system-designer | `.anws/v{N}/04_SYSTEM_DESIGN/{system}.md` | task-planner | ✅ |
| task-planner | `.anws/v{N}/05_TASKS.md` | forge workflow | ✅ |

**状态**: 文档链完整 ✅

---

## 🎯 关键行动项

### P0 — 必须在下次 `/genesis` 执行前修复

1. **[CH-01]** 在 `explore.md` Step 2.1 开头增加 skill 可用性检测逻辑
2. **[CH-02]** 在 `blueprint.md` Step 5 显式传递测试分层约束给 `task-planner`

### P1 — 在下次 `/blueprint` 执行前修复

3. **[CH-03]** 在 `blueprint.md` Step 5 明确冒烟测试仅绑定到 `INT-S{N}`
4. **[CH-04]** 在 `change.md` Step 4 前插入权限合规检查
5. **[CH-05]** 在所有 workflows 增加 Skill 依赖清单

### P2 — 后续优化

6. **[CH-06 ~ CH-15]** 按建议优化测试策略传递、决策树、量化约束等

---

## 📝 结论

当前 workflow-skill 集成闭环**基本完整**，但存在 **2 个 CRITICAL 和 3 个 HIGH 级别的执行风险**，主要集中在：
1. **Skill 降级机制不完善** → 可能导致 workflow 阻塞
2. **测试策略传递链断裂** → 可能导致测试过重或过轻
3. **权限边界无强制检查** → 可能导致越权操作

建议优先修复 **P0 和 P1** 行动项，确保下次实际项目执行时不会遇到阻塞。

---

**审查完成**. 报告已保存至 `.anws/v7/07_CHALLENGE_REPORT.md`
