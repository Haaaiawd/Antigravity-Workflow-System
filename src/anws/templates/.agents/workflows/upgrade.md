---
description: "在执行 anws update 后，读取 .anws/changelog/vX.Y.Z.md，判断升级等级（Minor / Major），生成人类可审核的升级计划，并路由到 /change 或 /genesis 执行后续修改。"
---

# /upgrade

<phase_context>
你是 **UPGRADE ORCHESTRATOR (升级编排师)**。

**核心使命**：
在 `anws update` 执行完成后，读取 `.anws/changelog/` 中最新的升级记录，分析框架层变化对业务文档的影响，判断应走 `/change` 还是 `/genesis`，并在获得人类批准后**路由到对应工作流继续执行**。

**核心原则**：
- **changelog 是升级依据** - 不凭印象升级，必须读取 `.anws/changelog/vX.Y.Z.md`
- **先定级，后路由** - 先判断 Minor / Major，再决定调用 `/change` 还是 `/genesis`
- **保护业务常量** - 禁止覆盖业务域名词、业务规则、产品约束
- **upgrade 只负责编排** - `/upgrade` 不自行绕过规范直接改文档，实际写操作必须遵循被路由工作流
- **人类审批** - 写操作前必须先展示升级计划，等待用户批准

**Output Goal**:
- 输出升级等级：`Minor` / `Major`
- 输出升级计划：影响范围、受影响文档、风险提示、推荐路由
- 获得人类批准后，明确切换到 `/change` 或 `/genesis`
</phase_context>

---

## ⚠️ CRITICAL 执行顺序

> [!IMPORTANT]
> 必须严格按 Step 0 → Step 1 → Step 2 → Step 3 → Step 4 执行。
> 禁止跳过 changelog 读取，禁止未定级先决定路由，禁止绕过人类检查点，禁止不读 `/change` 或 `/genesis` 就直接落笔。

---

## Step 0: 定位升级输入

1. 扫描 `.anws/changelog/`
2. 找到最新的 `vX.Y.Z.md`
3. 读取最新升级记录，提取：
   - 文件级变更
   - 内容级变更详情
   - 可能受影响的 workflow / skill / template
4. 扫描 `.anws/` 目录，找到最新的架构版本 `v{N}`
5. 设定上下文变量：
   - `LATEST_CHANGELOG = .anws/changelog/vX.Y.Z.md`
   - `CURRENT_ARCH = .anws/v{N}`

**若缺失任一目录**：停止并提示用户先运行 `anws update` 或 `/genesis`。

---

## Step 1: 升级定级 (Minor / Major)

> [!IMPORTANT]
> 升级类型由 AI 判断，不从 changelog 静态读取。
> **不再使用 Patch 级别**，只保留 `Minor` 与 `Major`，因为 `/upgrade` 的目标是决定跳转逻辑，而不是表达实现细粒度。

使用以下判定规则：

| 级别 | 判定标准 |
|------|---------|
| Minor | 变更可在当前版本内通过 `/change` 完成，不需要创建新的架构版本 |
| Major | 版本目录规则变化、核心工作流协议变化、架构边界变化、需要新版本承载 |

### 强制评估问题

1. 是否改变版本目录或核心路径约定？
2. 是否改变多个工作流的执行协议？
3. 是否影响 `01_PRD.md`、`02_ARCHITECTURE_OVERVIEW.md`、`03_ADR/` 的结构语义？
4. 是否需要保留旧版架构文档作为兼容参考？

**判定逻辑**：
- 影响局部文档、无需新版本 → `Minor`
- 需要新版本承载、会改变架构语义或目录协议 → `Major`

---

## Step 2: 影响分析与路由建议

1. 读取 `CURRENT_ARCH` 下的以下文件（按需）:
   - `01_PRD.md`
   - `02_ARCHITECTURE_OVERVIEW.md`
   - `03_ADR/*`
   - `04_SYSTEM_DESIGN/*`
   - `05_TASKS.md`（若存在）
2. 建立“框架变更 → 业务文档节点”的映射
3. 识别以下三类影响：
   - **路径迁移**：如 `.agent/` → `.agents/` 或工作流目录位置变化
   - **流程迁移**：如新增 `/upgrade`、`anws update --check`
   - **协议迁移**：如工作流优先原则、changelog 依赖
4. 对每个影响点标注：
   - 受影响文件
   - 受影响章节
   - 修改原因
   - 是否涉及 AI 推断填充
5. 生成**推荐路由**：
   - `Minor` → 推荐调用 `/change`
   - `Major` → 推荐调用 `/genesis`

> [!IMPORTANT]
> 此处只产出“升级计划”和“路由建议”，**不执行实际文档写入**。

---

## Step 3: 人类检查点 ⚠️

> [!IMPORTANT]
> 未经用户明确批准，禁止写任何文件。

必须向用户展示以下内容：

```markdown
⚠️ 人类检查点 — 升级计划确认

**最新 changelog**: `.anws/changelog/vX.Y.Z.md`
**当前架构版本**: `.anws/v{N}`
**升级定级**: Minor / Major
**推荐路由**: `/change` 或 `/genesis`

## 受影响文件
- `.anws/v{N}/01_PRD.md` — 原因: 路径约定变更
- `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` — 原因: 新增 update --check 流程

## 执行策略
- Minor: 进入 `/change`，按 `/change` 的权限边界和检查点修改
- Major: 进入 `/genesis`，按 `/genesis` 的版本化规则创建/演进新版本

## 风险提示
- 哪些段落需要 AI 推断
- 哪些业务常量将被保护不改

请确认: ✅ 批准并路由 / ❌ 拒绝 / ✏️ 调整
```

---

## Step 4: 路由到目标工作流

### Case A: Minor → `/change`

1. 接下来**必须读取**当前 target 对应的 `/change` 原生投影文件
2. 将 Step 2 的影响分析结果带入 `/change`
3. 后续所有修改动作必须遵守 `/change` 的权限边界、人类检查点和 CHANGELOG 记录规则
4. 若在 `/change` 评估中发现超出其权限边界，立即终止并改走 `/genesis`

### Case B: Major → `/genesis`

1. 接下来**必须读取**当前 target 对应的 `/genesis` 原生投影文件
2. 将 Step 2 的影响分析结果作为新版本演进输入带入 `/genesis`
3. 后续版本复制、文档演进、Manifest/ADR 变更必须遵守 `/genesis` 的版本管理逻辑

### AI 推断填充规则

若某段内容需要 AI 基于上下文补全，必须在段前加入：

```markdown
> [!WARNING]
> AI 推断填充，请人类复核。
```

### 业务常量保护规则

以下内容禁止被框架升级覆盖：
- 业务领域术语
- 产品目标
- 用户故事中的业务意图
- 团队特定约束
- 自定义系统边界

---

## 完成报告

完成路由后，向用户输出：
- 升级级别
- 推荐路由 (`/change` 或 `/genesis`)
- 计划影响的文件列表
- 是否预计创建新版本
- 是否存在 AI 推断填充风险
- 下一步必须读取的工作流文件

---

<completion_criteria>
- ✅ 已读取最新 `.anws/changelog/vX.Y.Z.md`
- ✅ 已完成升级定级
- ✅ 已输出推荐路由 (`/change` / `/genesis`)
- ✅ 已展示升级计划并获得用户批准
- ✅ 已在执行前切换去读取目标工作流
- ✅ 后续写操作由目标工作流规范接管
</completion_criteria>
