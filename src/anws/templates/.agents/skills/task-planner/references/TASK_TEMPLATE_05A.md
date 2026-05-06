# 05A_TASKS.md 模板参考

> 本文件是 `05A_TASKS.md` 的格式参考。`05A` 只负责执行主线，不包含详细验证设计。
> 详细验证计划见 `05B_VERIFICATION_PLAN.md`。

---

## 文档头部

```markdown
# 05A_TASKS.md — 执行主清单

> 版本: v{N}
> 产出自: /blueprint
> 最后更新: {Today}
>
> 验证计划: 05B_VERIFICATION_PLAN.md（每个任务有对应 `验证引用`）
```

---

## 依赖图总览

```markdown
## 依赖图总览

\`\`\`mermaid
graph TD
    T1.1.1[初始化项目] --> T2.1.1[实现核心逻辑]
    T2.1.1 --> T2.1.2[实现 API 端点]
    T3.1.1[数据库 Schema] --> T2.1.1
    T2.1.2 --> T1.2.1[前端集成]
\`\`\`
```

---

## Sprint 路线图

```markdown
## Sprint 路线图

| Sprint | 代号 | 核心任务 | 退出标准 | 预估 |
|--------|------|---------|---------|------|
| S1 | Hello World | 基础设施 + 核心数据 | headless 可运行 + 基本功能可观察 | 3-4d |
| S2 | 功能成型 | 核心业务逻辑 + API | 完整功能可演示 | 5-6d |
```

---

## System 任务列表

### 任务格式

```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: 任务标题
  - **描述**: 做什么（不是怎么做）
  - **输入**: 设计文档引用 + 前置任务产出（必须包含至少一个文档引用）
    - 示例: `04_SYSTEM_DESIGN/auth.md §JWT 签发`、`T1.1.1 产出的 App.tsx`
  - **输出**: 产出的文件/组件/接口
    - 示例: `src/auth/jwt.ts`、`POST /auth/login`
  - **契约承接**: 本任务实现或验证的公共契约；如无写"无"
    - 示例: `POST /auth/login` 接口契约
  - **参考**: ADR-XXX 或 System Design 章节（如有）
  - **验收标准**:
    - Given [前置条件]
    - When [执行动作]
    - Then [预期结果]
    - （仅纯技术性基础任务允许使用 Done When 列表）
  - **验证类型**: 单元测试 | API接口功能测试 | 集成测试 | E2E测试 | 冒烟测试 | 回归测试 | 手动验证 | 编译检查 | Lint检查
  - **E2E触发设想**: 若需 E2E，写明触发条件与关键用户链路（规划占位，不在 blueprint/planner 阶段执行）
  - **验证摘要**: 验证目标与边界的简要说明（不展开完整用例）
  - **验证引用**: `05B_VERIFICATION_PLAN.md#t-x-y-z`
  - **证据产出**: `tests/unit/auth.test.ts`, `reports/api-test.html`
  - **估时**: 4h
  - **依赖**: T1.1.1
  - **优先级**: P0 | P1 | P2
```

### 完整示例

```markdown
## System 1: 后端 API 系统

### Phase 1: Foundation（基础设施）

- [ ] **T1.1.1** [基础]: 初始化后端项目
  - **描述**: 初始化 Node.js 项目，配置 TypeScript、ESLint、pnpm
  - **输入**: `02_ARCHITECTURE_OVERVIEW.md §技术栈`
  - **输出**: 可运行的项目骨架，`package.json`、`tsconfig.json`
  - **契约承接**: 无
  - **验收标准**:
    - Done When `pnpm install` 无报错
    - Done When `pnpm run build` 编译通过
    - Done When `pnpm run lint` 无错误
  - **验证类型**: 编译检查 / Lint检查
  - **验证摘要**: 验证项目初始化正确，编译和 Lint 通过
  - **验证引用**: `05B_VERIFICATION_PLAN.md#t1-1-1`
  - **证据产出**: `logs/build.log`
  - **估时**: 2h
  - **依赖**: 无
  - **优先级**: P0

### Phase 2: Core（核心功能）

- [ ] **T1.2.1** [REQ-001]: 实现 `POST /auth/login` 端点
  - **描述**: 实现用户登录接口，验证凭证并签发 JWT Token
  - **输入**: `04_SYSTEM_DESIGN/auth.md §JWT 签发流程`、`T1.1.1 产出的项目骨架`
  - **输出**: `src/routes/auth.ts`、`POST /auth/login` 接口
  - **契约承接**: `POST /auth/login` HTTP API 契约
  - **参考**: `03_ADR/ADR-001-auth.md`
  - **验收标准**:
    - Given 合法用户名和密码
    - When 调用 `POST /auth/login`
    - Then 返回 200，body 包含有效 JWT Token
  - **验证类型**: 单元测试 + API接口功能测试
  - **验证摘要**: 单元测试覆盖 JWT 签发逻辑；API接口功能测试覆盖正常/参数错误/凭证错误场景
  - **验证引用**: `05B_VERIFICATION_PLAN.md#t1-2-1`
  - **证据产出**: `tests/unit/jwt.test.ts`, `tests/api/auth.test.ts`
  - **估时**: 6h
  - **依赖**: T1.1.1
  - **优先级**: P0
```

---

## INT 集成验证任务格式

```markdown
- [ ] **INT-S1** [MILESTONE]: S1 集成验证 — Hello World
  - **描述**: 验证 S1 退出标准：基础设施就绪，核心接口可调用
  - **输入**: S1 所有任务的产出
  - **输出**: 集成验证报告（通过/失败 + Bug 清单）
  - **验收标准**:
    - Given S1 所有任务已完成
    - When 逐条执行退出标准中的检查
    - Then 全部通过 → Sprint 完成; 有失败 → 记录 Bug
  - **验证类型**: 冒烟测试 / 集成测试
  - **验证说明**: 按退出标准逐条执行；截图/日志确认；若触及已完成关键能力则追加最小回归检查
  - **估时**: 2-4h
  - **依赖**: T1.2.1, T1.2.2
```

---

## User Story Overlay（追加在文档末尾）

```markdown
## User Story Overlay

### US-001: 用户登录 (P0)
**涉及任务**: T1.1.1 → T1.2.1 → T2.1.1
**关键路径**: T1.1.1 → T1.2.1
**独立可测**: S1 结束即可演示
**覆盖状态**: ✅ 完整

### US-002: 用户注册 (P1)
**涉及任务**: T1.2.2
**关键路径**: T1.1.1 → T1.2.2
**独立可测**: 缺少 T2.x 用户表创建任务
**覆盖状态**: ⚠️ 不完整 — 缺少 Database System 侧任务
```

