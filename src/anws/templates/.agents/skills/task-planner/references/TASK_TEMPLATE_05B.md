# 05B_VERIFICATION_PLAN.md 模板参考

> 本文件是 `05B_VERIFICATION_PLAN.md` 的格式参考。`05B` 只负责验证设计，不包含执行任务主线。
> 执行主清单见 `05A_TASKS.md`。

---

## 文档头部

```markdown
# 05B_VERIFICATION_PLAN.md — 验证计划

> 版本: v{N}
> 产出自: /blueprint
> 最后更新: {Today}
>
> 执行主清单: 05A_TASKS.md（每个验证条目有对应 Task ID）
```

---

## 章节结构总览

```
1. 范围与目标
2. 验证分层策略
3. 风险类别覆盖原则
4. 测试材料与证据要求
5. Task-by-Task 验证计划
6. Contract Coverage Overlay
7. Testing Coverage Overlay
8. Verification Traceability Matrix
```

> [!IMPORTANT]
> 第 6/7/8 章是 05B 的核心追溯骨架，属于硬性必选，不可删除或合并替代：
>
> - 1. Contract Coverage Overlay（回答“哪些契约被谁实现、由谁验证”）
> - 1. Testing Coverage Overlay（回答“哪些风险类别由什么测试覆盖”）
> - 1. Verification Traceability Matrix（回答“REQ/Contract → Task → Verification → Evidence”的审计链）

---

## 第 1–4 章：策略说明格式

```markdown
## 1. 范围与目标

本验证计划覆盖 v{N} 所有 P0/P1 任务，确保：
- 系统核心功能、关键业务逻辑、异常处理机制的正确性、稳定性和健壮性
- 项目验收必须同时包含单元测试与 API 接口功能测试

## 2. 验证分层策略

| 层次 | 负责范围 | 主要工具 |
|------|---------|---------|
| 单元测试 | 局部逻辑、状态转换、异常处理 | Jest / pytest / go test |
| API接口功能测试 | HTTP API 契约、错误语义、数据变更 | Postman / httpie / pytest |
| 集成测试 | 跨模块/跨服务协作 | 集成测试框架 |
| E2E测试 | 关键用户故事端到端链路 | Playwright / Cypress |
| 冒烟测试 | Sprint 退出关口关键路径 | 绑定 INT-S{N} 执行 |
| 回归测试 | 新变更未破坏已完成关键能力 | 复用已有测试集合 |

## 3. 风险类别覆盖原则

- 按风险类别闭合，而非测试数量最大化
- 优先等价类划分、边界值、代表性错误样本
- 禁止对所有字段与参数组合做笛卡尔积枚举
- 单元测试负责细粒度逻辑，API接口功能测试负责对外契约，E2E 只保留关键用户链路

## 4. 测试材料与证据要求

| 验证类型 | 测试材料位置 | 证据形式 |
|---------|------------|---------|
| 单元测试 | `tests/unit/` | 测试运行报告 / CI 日志 |
| API接口功能测试 | `tests/api/` | HTTP 响应记录 / 测试报告 |
| 集成测试 | `tests/integration/` | 集成测试报告 |
| E2E测试 | `tests/e2e/` | 截图 / 录屏 |
| 冒烟测试 | 绑定 INT-S{N} | 关键路径截图 / 日志 |
```

---

## 第 5 章：Task-by-Task 验证计划格式

每个 05A 中的 Task 在此对应一个详细验证条目：

```markdown
## 5. Task-by-Task 验证计划

### T1.2.1
- **关联需求**: REQ-001（用户登录）
- **关联契约**: `POST /auth/login` HTTP API 契约
- **风险类别**: API契约 / 认证逻辑 / 错误语义
- **单元测试覆盖**:
  - JWT 签发逻辑：合法输入返回有效 token（正常）
  - JWT 签发逻辑：空密钥抛出 ConfigurationError（异常处理）
  - 密码比对：哈希匹配返回 true，不匹配返回 false（边界）
- **API接口功能测试覆盖**:
  - 正常请求：合法用户名 + 密码 → 200 + JWT Token
  - 参数缺失：body 缺少 `password` 字段 → 400 + `MISSING_PARAM` 错误码
  - 参数格式错误：`username` 为空字符串 → 400 + `INVALID_PARAM` 错误码
  - 权限不足：凭证错误 → 401 + `INVALID_CREDENTIALS` 错误码
  - 数据变更前后：无（登录接口不修改数据）
- **集成/E2E/冒烟覆盖**: 绑定 INT-S1 冒烟测试，验证登录流程端到端可用
- **前置数据**: 数据库中存在测试用户 `user@test.com`（密码已哈希存储）
- **断言**:
  - 200 响应 body 包含 `token` 字段，且为有效 JWT 格式
  - 401 响应 body 包含 `error.code === "INVALID_CREDENTIALS"`
  - 400 响应 body 包含 `error.code`，且与错误类型匹配
- **证据**: `tests/unit/jwt.test.ts`, `tests/api/auth.test.ts`, CI 测试报告

### INT-S1
- **关联需求**: S1 退出标准
- **关联契约**: 所有 S1 完成任务的公共契约
- **风险类别**: 系统可用性 / Sprint 关口
- **单元测试覆盖**: 不适用（INT 任务不新增单元测试）
- **API接口功能测试覆盖**: 不适用
- **集成/E2E/冒烟覆盖**: 按 Sprint 路线图退出标准逐条执行冒烟测试
- **前置数据**: S1 所有任务已完成且产出可用
- **断言**: 退出标准中每条可观察行为验证通过
- **证据**: 截图 / 录屏 / 集成验证报告
```

---

## 第 6 章：Contract Coverage Overlay 格式

> 必须存在，不可删除。

```markdown
## 6. Contract Coverage Overlay

| 契约 | 类型 | 实现承接 | 验证承接 | 状态 |
|------|------|---------|---------|:----:|
| `POST /auth/login` HTTP API | HTTP API | T1.2.1 | T1.2.1 API接口功能测试 | ⬜ |
| JWT Token 签发语义 | 操作契约 | T1.2.1 | T1.2.1 单元测试 | ⬜ |
| `INVALID_CREDENTIALS` 错误语义 | 错误语义 | T1.2.1 | T1.2.1 API接口功能测试 | ⬜ |
| users 表持久化结构 | 持久化结构 | T3.1.1 | T3.1.1 集成测试 | ⬜ |
```

---

## 第 7 章：Testing Coverage Overlay 格式

> 必须存在，不可删除。

```markdown
## 7. Testing Coverage Overlay

| 测试责任 | 风险类别 | 覆盖方法 | 任务承接 | 测试材料 | 状态 |
|---------|---------|---------|---------|---------|:----:|
| JWT 签发：正常/边界/异常 | 业务逻辑 | 单元测试 + 参数化用例 | T1.2.1 | `tests/unit/jwt.test.ts` | ⬜ |
| `POST /auth/login` 缺参/格式错误/权限不足 | API契约 | API接口功能测试 + 代表性错误样本 | T1.2.1 | `tests/api/auth.test.ts` | ⬜ |
| 用户状态 active/inactive/locked | 状态转换 | 单元测试 + 状态表驱动用例 | T1.2.2 | `tests/unit/user.test.ts` | ⬜ |
| 密码修改接口前后状态一致 | 数据一致性 | API接口功能测试 + before/after 断言 | T1.2.3 | `tests/api/password.test.ts` | ⬜ |
```

---

## 第 8 章：Verification Traceability Matrix 格式

> 必须存在，不可删除。

```markdown
## 8. Verification Traceability Matrix

| REQ/Contract | Task | Verification | Test Material | Evidence | Status |
|---|---|---|---|---|---|
| REQ-001 用户登录 | T1.2.1 | 单元测试 + API接口功能测试 | `tests/unit/jwt.test.ts`, `tests/api/auth.test.ts` | CI 测试报告 | ⬜ |
| `POST /auth/login` 契约 | T1.2.1 | API接口功能测试 | `tests/api/auth.test.ts` | HTTP 响应记录 | ⬜ |
| users 表持久化结构 | T3.1.1 | 集成测试 | `tests/integration/db.test.ts` | 集成测试报告 | ⬜ |
| S1 退出标准 | INT-S1 | 冒烟测试 | Sprint 冒烟脚本 | 截图 / 验证报告 | ⬜ |
```

