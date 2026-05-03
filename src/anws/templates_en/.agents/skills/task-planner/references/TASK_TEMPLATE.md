# Task Decomposition Template

**Project**: [Project Name]  
**Blueprint Phase**: Approved  
**RFC Reference**: `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md`

---

## Task List

### Legend
- **ID**: Unique task identifier (T{System}.{Phase}.{Seq})
- **[P]**: Parallel (can execute independently)
- **[MILESTONE]**: Milestone / Sprint gate task (e.g., `INT-S{N}`)
- **User Story**: Mapped to PRD (US01, US02...)
- **Acceptance Criteria**: Given / When / Then or Done When format completion conditions
- **Verification Type**: Unit test / Integration test / E2E test / Smoke test / Regression test / Manual verification / Compilation check / Lint check
- **Verification Description**: How to verify task completion, what evidence needed
- **Contract Handoff**: Public contracts this task implements or verifies (e.g., interfaces, CLI semantics, config structure, file format, error semantics)
- ** ADR**: Associated architecture decision record
- ** System**: Associated system design document

### Generation Reminders
- Public contracts must have at least one implementation task handoff
- High-risk public contracts must have at least one verification handoff point
- Base layer, shared layer, pure logic layer default prioritize unit tests
- Base logic like registry / manifest / parser / planner / schema / diff / merge / normalizer / selector should have main branches, boundary cases and error paths covered by unit tests as much as possible
- Smoke tests default converge to `INT-S{N}` or very few milestone tasks, do not spread to ordinary development tasks
- Task granularity default controlled within 2h-2d; pure technical base tasks can use Done When, other tasks prioritize Given / When / Then

---

### Phase 1: Foundation Phase

#### T3.1.1 - Database Schema Initialization
- **User Story**: US01
- **Description**: Create `users` table, containing `id`, `email`, `password_hash`, `created_at` fields.
- **Input**: `04_SYSTEM_DESIGN/database.md` §User table design
- **Output**: `migrations/001_create_users.sql`
- **Contract Handoff**: Database schema contract (`users` table structure)
- **Dependencies**: None
- **Acceptance Criteria**:
  - Given database started
  - When execute migration and view `users` table structure
  - Then table fields consistent with system design
- **Verification Type**: Integration test
- **Verification Description**: Run migration and execute `psql -c "\d users"`, keep terminal output as evidence
- ** ADR**: ADR-003 (Password storage solution)

#### T1.1.1 - [P] Environment Configuration
- **User Story**: US01
- **Description**: Add `.env` file containing `DATABASE_URL`, `JWT_SECRET`.
- **Input**: `02_ARCHITECTURE_OVERVIEW.md` §Environment configuration
- **Output**: `.env.example`, `docker-compose.yml`
- **Contract Handoff**: Environment configuration structure contract
- **Dependencies**: None
- **Acceptance Criteria**:
  - Given environment variable template and container configuration written
  - When execute `docker-compose up`
  - Then database can start without errors
- **Verification Type**: Compilation check
- **Verification Description**: Start dependency services and confirm terminal output has no errors

---

### Phase 2: Core Logic

#### T2.1.1 - User Registration Endpoint
- **User Story**: US01
- **Description**: Implement `POST /api/register`, hash password and save user.
- **Input**: `04_SYSTEM_DESIGN/auth.md` §Registration flow, `users` table produced by T3.1.1
- **Output**: `src/routes/auth.js`, `src/services/user.service.js`
- **Contract Handoff**: `POST /api/register` HTTP API contract
- **Dependencies**: T3.1.1
- **Acceptance Criteria**:
  - Given registration endpoint implemented
  - When send valid registration request
  - Then return 201 and user written to database
- **Verification Type**: Integration test
- **Verification Description**: Call `POST /api/register` and check response and database write result
- ** ADR**: ADR-003 (Password storage solution)

#### T2.1.2 - [P] JWT Token Generation
- **User Story**: US01
- **Description**: Create `generate_token(user_id)` helper function.
- **Input**: `04_SYSTEM_DESIGN/auth.md` §JWT signing, `JWT_SECRET` config produced by T1.1.1
- **Output**: `src/utils/jwt.js`
- **Contract Handoff**: JWT generation rule contract (base logic)
- **Dependencies**: T1.1.1
- **Acceptance Criteria**:
  - Given JWT helper function implemented
  - When run `test_generate_token()`
  - Then all assertions pass
- **Verification Type**: Unit test
- **Verification Description**: Execute JWT related tests and confirm tests pass
- ** ADR**: ADR-004 (JWT authentication solution)

---

## Iteration Roadmap

| Iteration | Code | Core Tasks | Exit Criteria | Estimate |
|-----------|------|------------|---------------|----------|
| S1 | Foundation Phase | T1.1.1, T3.1.1 | DB connectable + environment variables effective | 1d |
| S2 | Core Logic | T2.1.1-T2.2.1 | Complete authentication flow runnable | 2d |

---

### Phase 3: Integration Phase

#### T2.2.1 - Login Endpoint
- **User Story**: US01
- **Description**: Implement `POST /api/login`, verify credentials and return JWT.
- **Input**: `04_SYSTEM_DESIGN/auth.md` §Login flow, `users` table produced by T2.1.1, `generate_token()` function produced by T2.1.2
- **Output**: `/api/login` endpoint (`src/routes/auth.js`)
- **Contract Handoff**: `POST /api/login` HTTP API contract; 401 error semantics
- **Dependencies**: T2.1.1, T2.1.2
- **Acceptance Criteria**:
  - Given login endpoint implemented
  - When request login with valid credentials
  - Then return JWT
  - Given invalid credentials
  - When request login
  - Then return 401
- **Verification Type**: Integration test
- **Verification Description**: Call `/api/login` and check success and failure paths separately
- ** ADR**: ADR-004 (JWT authentication solution)

#### INT-S2 - [MILESTONE] S2 Integration Verification — Core Logic
- **User Story**: US01
- **Description**: Verify S2 exit criteria: complete authentication flow runnable
- **Input**: `02_ARCHITECTURE_OVERVIEW.md` §Authentication flow, output of all S2 tasks
- **Output**: Integration verification report
- **Contract Handoff**: Registration/login main chain contract; critical path minimal smoke verification
- **Dependencies**: T2.1.1, T2.1.2, T2.2.1
- **Acceptance Criteria**:
  - Given S2 all tasks completed and service started
  - When register new user through `/api/register` and login with valid credentials
  - Then receive JWT token and main chain runnable
  - Given invalid credentials
  - When request `/api/login`
  - Then return 401 and error semantics match contract
  - Given this Sprint related auto verification executed
  - When view test and lint results
  - Then unit tests pass and no Linter errors
- **Verification Type**: Integration test / Smoke test
- **Verification Description**: Execute exit criteria one by one; use real registration and login chain as minimal smoke check, and keep logs or screenshots

---

## Dependency Graph

```
T3.1.1 (Database Schema)
  → T2.1.1 (Registration)
      → T2.2.1 (Login)

T1.1.1 (Environment Configuration) [P]
  → T2.1.2 (JWT Helper Function) [P]
      → T2.2.1 (Login)
```

---

## Summary

| Phase | Total Tasks | Parallelizable |
|-------|-------------|---------------|
| 1     | 2           | 1             | 
| 2     | 2           | 1             | 
| 3     | 1           | 0             | 
| **Total** | **5** | **2** |

---

## Acceptance Criteria

Before marking blueprint as complete:
- [ ] All tasks have unique IDs
- [ ] Dependencies clear (use `→` to indicate)
- [ ] Each task has `Acceptance Criteria`
- [ ] Each task has `Verification Type` and `Verification Description`
- [ ] Each public contract has implementation handoff, and high-risk public contracts have clear verification handoff
- [ ] Base layer low-dependency logic default get unit test handoff, and cover main branches/boundaries/error paths
- [ ] **Each task's "Input" references design documents** (ADR/System Design/PRD/Architecture)
- [ ] Tasks do not contain actual code (only keep <10 line descriptions)
- [ ] Overall estimate reasonable
- [ ] User confirmed this task list

---

## Anti-Patterns to Avoid

 **Bad task example**:
```
T001 - Build authentication system
- Do everything authentication related
- Make it safe and fast
```

 **Good task example**:
```
T3.1.1 - Database Schema Initialization
- Input: `04_SYSTEM_DESIGN/database.md` §User table design
- Description: Create `users` table containing `id`, `email`, `password_hash`.
- Contract Handoff: Database schema contract
- Acceptance Criteria: Given migration complete, When view table structure, Then fields match design.
- Verification Type: Integration test
- ADR: ADR-003 (Password storage solution)
```

---

**Next step**: Enter `/forge` workflow, implement these tasks in order.
