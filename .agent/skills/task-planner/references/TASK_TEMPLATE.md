# Task Decomposition Template

**Project**: [Project Name]  
**Blueprint Phase**: Approved  
**RFC Reference**: `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md`

---

## 📋 Task List

### Legend
- **ID**: Unique task identifier (T001, T002...)
- **[P]**: Parallelizable (can run independently)
- **[Verification]**: Checkpoint task (manual/E2E validation)
- **User Story**: Maps to PRD (US01, US02...)
- **Done When**: Verification criterion

---

### Phase 1: Foundation

#### T001 - Database Schema Setup
- **User Story**: US01
- **Description**: Create `users` table with fields: `id`, `email`, `password_hash`, `created_at`.
- **Dependencies**: None
- **Done When**: `psql -c "\d users"` shows correct schema.
  
#### T002 - [P] Environment Configuration
- **User Story**: US01
- **Description**: Add `.env` file with `DATABASE_URL`, `JWT_SECRET`.
- **Dependencies**: None
- **Done When**: `docker-compose up` starts DB without errors.


---

### Phase 2: Core Logic

#### T003 - User Registration Endpoint
- **User Story**: US01
- **Description**: Implement `POST /api/register` that hashes password and stores user.
- **Dependencies**: T001 (DB Schema)
- **Done When**: `curl -X POST /api

#### T004 - [P] JWT Token Generation
- **User Story**: US01
- **Description**: Create `generate_token(user_id)` helper function.
- **Dependencies**: T002 (JWT_SECRET configured)
- **Done When**: Unit test `test_generate_token()` passes.

---

## 📊 Sprint 路线图

| Sprint | 代号 | 核心任务 | 退出标准 | 预估 |
|--------|------|---------|---------|------|
| S1 | Foundation | T001-T002 | DB 可连接 + 环境变量生效 | 1d |
| S2 | Core Logic | T003-T005 | 完整认证流程可运行 | 2d |

---

### Phase 3: Integration

#### T005 - Login Endpoint
- **User Story**: US01
- **Description**: Implement `POST /api/login` that validates credentials and returns JWT.
- **Dependencies**: T003 (User table populated), T004 (JWT generator ready)
- **Input**: T003 产出的 `users` 表 + T004 产出的 `generate_token()` 函数
- **Output**: `/api/login` 端点 (`src/routes/auth.js`)
- **Done When**: 
  1. Valid login returns `{token: "..."}`.
  2. Invalid login returns 401.

#### INT-S2 - [MILESTONE] S2 集成验证 — Core Logic
- **User Story**: US01
- **Type**: Integration Verification (Sprint Gate)
- **Description**: 验证 S2 退出标准：完整认证流程可运行
- **Dependencies**: All S2 tasks (T003-T005)
- **Done When**:
  1. Run `npm run dev` or equivalent
  2. Register a new user via `/api/register`
  3. Login with valid credentials → receives JWT token
  4. Login with invalid credentials → receives 401 error
  5. All unit tests pass (`npm test`)
  6. No linter errors (`npm run lint`)

---

## 🔗 Dependency Graph

```
T001 (DB Schema)
  → T003 (Register)
      → T005 (Login)

T002 (Env Config) [P]
  → T004 (JWT Helper) [P]
      → T005 (Login)
```

---

## 📊 Summary

| Phase | Total Tasks | Parallelizable |
|-------|-------------|----------------|
| 1     | 2           | 1              | 
| 2     | 2           | 1              | 
| 3     | 1           | 0              | 
| **Total** | **5**   | **2**          |

---

## ✅ Acceptance Criteria

Before marking Blueprint as complete:
- [ ] All tasks have unique IDs
- [ ] Dependencies are explicit (→ notation)
- [ ] Each task has "Done When" criterion
- [ ] No task contains actual code (only descriptions <10 lines)
- [ ] Total estimated time is realistic
- [ ] User has approved this task list

---

## 🚫 Anti-Patterns to Avoid

❌ **Bad Task**:
```
T001 - Build Authentication System
- Implement everything related to auth
- Make it secure and fast
```

✅ **Good Task**:
```
T001 - Database Schema Setup
- Description: Create `users` table with `id`, `email`, `password_hash`.
- Done When: `psql -c "\d users"` shows correct schema.
```

---

**Next Step**: Proceed to `/build` workflow to implement tasks sequentially.
