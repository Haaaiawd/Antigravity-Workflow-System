# Task Decomposition Template

**Project**: [Project Name]  
**Blueprint Phase**: Approved  
**RFC Reference**: `blueprint/02_RFC.md`

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

### Phase 3: Integration

#### T005 - Login Endpoint
- **User Story**: US01
- **Description**: Implement `POST /api/login` that validates credentials and returns JWT.
- **Dependencies**: T003 (User table populated), T004 (JWT generator ready)
- **Done When**: 
  1. Valid login returns `{token: "..."}`.
  2. Invalid login returns 401.

#### T005-CHK - [Verification] Verify US01 - User Authentication
- **User Story**: US01
- **Type**: Checkpoint (Story Milestone)
- **Description**: Validate entire authentication flow works end-to-end.
- **Dependencies**: All US01 tasks (T001-T005)
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
