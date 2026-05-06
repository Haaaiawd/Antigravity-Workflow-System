---
description: "编排 /blueprint：基于设计输入生成 05A_TASKS.md 与 05B_VERIFICATION_PLAN.md，并完成收口检查。"
---

# /blueprint

你是 **TASK ARCHITECT (任务规划师)**。

## 目标

- 产出 `.anws/v{N}/05A_TASKS.md`（执行主清单）
- 产出 `.anws/v{N}/05B_VERIFICATION_PLAN.md`（验证计划）

---

## 编排边界

`/blueprint` 只负责流程编排与关卡校验，不重复维护详细模板。  
任务字段、验证字段、示例格式以 `task-planner/SKILL.md` 与 `references/TASK_TEMPLATE_05A.md`、`references/TASK_TEMPLATE_05B.md` 为唯一事实源。

---

## Step 0: 定位版本与前置检查

1. 扫描 `.anws/` 找到最新 `v{N}`，设定 `TARGET_DIR = .anws/v{N}`。
2. 必需文件：
   - `{TARGET_DIR}/01_PRD.md`
   - `{TARGET_DIR}/02_ARCHITECTURE_OVERVIEW.md`
3. 条件必需：
   - 若版本涉及公共契约（HTTP API、CLI 参数语义、配置结构、文件格式、错误语义、跨系统协议、持久化结构），`{TARGET_DIR}/04_SYSTEM_DESIGN/` 视为必需。
4. 若前置不满足：停止并提示先运行 `/genesis` 或 `/design-system`。

---

## Step 1: 加载输入并建立契约映射

1. 读取 `01_PRD.md`、`02_ARCHITECTURE_OVERVIEW.md`、`03_ADR/`（以及存在时的 `04_SYSTEM_DESIGN/`）。
2. 从输入中提取公共契约与风险点。
3. 形成契约映射规则（供 `task-planner` 执行）：
   - 每个公共契约至少有一个实现承接任务（05A）
   - 每个高风险公共契约至少有一个验证承接点（05B）
   - 禁止把契约验证责任全部后移到高层集成或 E2E

---

## Step 2: 调用 task-planner 生成 A/B 双文档

调用 `task-planner`，并显式传递约束：

- 输入文档是唯一事实来源
- 若 ADR 存在测试策略与质量门禁，必须优先遵循
- 验证类型按“最轻但足够”选择，避免 E2E 滥用
- 单元测试与 API接口功能测试必须同时规划
- 冒烟测试优先绑定 `INT-S{N}` 里程碑任务
- 仅在 `05A/05B` 中记录 E2E 触发条件、范围与证据预期；**不得在 `/blueprint` 阶段执行 `e2e-testing-guide`**

---

## Step 3: 收口写入

1. 保存：
   - `.anws/v{N}/05A_TASKS.md`
   - `.anws/v{N}/05B_VERIFICATION_PLAN.md`
2. 在 `05A_TASKS.md` 中保留执行主线内容（WBS、依赖、Sprint、INT、User Story Overlay）。
3. 在 `05B_VERIFICATION_PLAN.md` 中保留验证主线内容（Task-by-Task、Contract Coverage Overlay、Testing Coverage Overlay、Verification Traceability Matrix）。
4. 更新 `AGENTS.md` 的 A/B 文档入口状态块。

---

## Step 4: 必过检查清单

- [ ] `05A_TASKS.md` 与 `05B_VERIFICATION_PLAN.md` 均已生成
- [ ] 每个 05A 任务都含 `验证引用` 且可在 05B 定位到对应条目
- [ ] 05B 中保留 Contract Coverage Overlay、Testing Coverage Overlay、Verification Traceability Matrix
- [ ] 单元测试与 API接口功能测试职责均已规划
- [ ] 测试覆盖按风险类别闭合，且未出现测试膨胀
- [ ] `AGENTS.md` 已更新为 A/B 双文档入口
