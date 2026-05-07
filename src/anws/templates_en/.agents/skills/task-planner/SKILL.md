---
name: task-planner
description: Use WBS to decompose system design into an execution list (05A_TASKS.md) and a verification plan (05B_VERIFICATION_PLAN.md), with dependency analysis, traceability, and evidence ownership.
---

# Task Planner

You are the task decomposition and verification orchestration skill.

Outputs:
- `.anws/v{N}/05A_TASKS.md` (execution list)
- `.anws/v{N}/05B_VERIFICATION_PLAN.md` (verification plan)

---

## Fast Flow

1. Read `01_PRD.md` and `02_ARCHITECTURE_OVERVIEW.md`.
2. Read `03_ADR/` and `04_SYSTEM_DESIGN/` when available.
3. If ADR provides testing strategy or quality gates, follow them first.
4. Extract public contracts (HTTP API, CLI, config, format, error semantics, persistence, cross-system interfaces).
5. Generate WBS tasks to 05A.
6. Generate verification anchors and evidence ownership to 05B.

---

## Split Responsibilities

### 05A_TASKS.md (Execution Track)

- WBS task definitions
- dependencies and estimates
- sprint roadmap
- INT milestone tasks
- progress checkboxes
- User Story Overlay

### 05B_VERIFICATION_PLAN.md (Verification Track)

- verification layering strategy
- risk-category coverage rules
- Task-by-Task verification plan
- Contract Coverage Overlay
- Testing Coverage Overlay
- Verification Traceability Matrix

> [!IMPORTANT]
> The following three sections are mandatory in 05B and must not be removed:
> - Contract Coverage Overlay
> - Testing Coverage Overlay
> - Verification Traceability Matrix

---

## 05A Task Structure

```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: Task title
  - **Description**: what to build (not how)
  - **Input**: design references + predecessor outputs (must include at least one design document reference)
  - **Output**: files/components/interfaces/artifacts
  - **Contract Ownership**: public contract implemented or verified by this task, or "None"
  - **Reference**: ADR/System Design section if applicable
  - **Acceptance Criteria**:
    - Given ...
    - When ...
    - Then ...
    - (Clear Done When is allowed only for pure technical foundation tasks)
  - **Verification Type**: Unit Test | API Interface Functional Test | Integration Test | E2E Test | Smoke Test | Regression Test | Manual Verification | Build Check | Lint Check
  - **Verification Summary**: verification scope and boundary only
  - **Verification Reference**: `05B_VERIFICATION_PLAN.md#t-x-y-z`
  - **Evidence Output**: `tests/...`, `reports/...`, `screenshots/...`, `logs/...`
  - **Estimate**: Xh
  - **Dependencies**: T{A}.{B}.{C}
  - **Priority**: P0 | P1 | P2
```

---

## 05B Verification Structure

### Task-by-Task Entry

```markdown
### T{X}.{Y}.{Z}
- Related Requirement:
- Related Contract:
- Risk Category:
- Unit Test Coverage:
- API Interface Functional Test Coverage:
- Integration/E2E/Smoke Coverage:
- Preconditions/Test Data:
- Assertions:
- Evidence:
```

### Traceability Matrix

```markdown
## Verification Traceability Matrix
| REQ/Contract | Task | Verification | Test Material | Evidence | Status |
|---|---|---|---|---|---|
```

---

## Verification Type Selection Logic

Follow the "lightest sufficient proof" principle:

1. Local logic / pure algorithm / state transition / exception handling -> Unit Test
2. HTTP API / CLI API / permission boundary / error semantics / data-changing endpoint -> API Interface Functional Test
3. Cross-module or cross-service collaboration -> Integration Test
4. Critical end-user journey -> E2E Test or Manual Verification
5. Sprint milestone gate -> Smoke Test (prefer binding to `INT-S{N}`)
6. Changes that may impact existing critical behavior -> Regression Test
7. Config or scaffolding tasks -> Build Check / Lint Check / Manual Verification

Selection rules:
- do not upgrade to E2E by default
- for public API changes, verification must include normal and representative invalid request paths
- data-changing endpoints must include before/after assertions
- auth/role/permission changes must include permission-denied scenarios

### E2E Execution Boundary (Hard Rule)

- `task-planner` only records E2E trigger assumptions, coverage scope, and expected evidence in `05A_TASKS.md` / `05B_VERIFICATION_PLAN.md`
- planning phase must not call or execute `e2e-testing-guide`
- actual E2E guide generation and real-browser validation are executed by `/forge` when triggered by tasks

---

## Hard Testing Constraints

> [!IMPORTANT]
> Project acceptance must include both Unit Tests and API Interface Functional Tests.

### Unit Test Responsibilities

- normal, boundary, and invalid input
- critical state transitions (create, execute, fail, retry style)
- exception handling (null, out-of-range, invalid state) with stable behavior

### API Interface Functional Test Responsibilities

- normal request path
- missing parameter, malformed parameter, and permission-denied scenarios
- expected error code and error message semantics
- before/after assertions for data-changing interfaces

### Anti-Bloat Policy

- close risk categories, do not maximize raw test counts
- prefer equivalence classes, boundary values, representative invalid samples, parameterized or table-driven tests
- avoid full Cartesian-product enumeration
- keep E2E focused on key user chains

---

## Contract Coverage Rules

> [!IMPORTANT]
> If task outputs include or modify public contracts, explicit verification ownership is mandatory.

Public contract coverage is mandatory whenever tasks create or modify externally observable behavior.

Rules:
- each public contract needs at least one implementation owner task
- each high-risk public contract needs at least one verification owner point
- implementation-only is not contract closure
- foundational low-dependency logic defaults to Unit Test ownership
- external interfaces (HTTP API / CLI API) default to explicit API Interface Functional Test evaluation
- error semantics and before/after data state are observable contract parts and cannot be skipped

---

## WBS Method

### Three Levels

```text
Level 1: System  <- system list from Architecture Overview
Level 2: Phase   <- Foundation / Core / Integration / Polish
Level 3: Task    <- concrete tasks, typically 2h-2d granularity
```

### Sprint Roadmap Format

```markdown
## Sprint Roadmap

| Sprint | Codename | Core Work | Exit Criteria | Estimate |
|--------|----------|-----------|---------------|----------|
| S1     | Hello World | Infrastructure + core data | headless run passes + basic rendering visible | 3-4d |
```

Exit criteria requirements:
- objectively verifiable (screenshots / recordings / logs)
- describe observable behavior for users or developers
- include cross-system integration signals

### Integration Verification Task (`INT-S{N}`)

```markdown
- [ ] **INT-S{N}** [MILESTONE]: S{N} integration verification — {codename}
  - **Description**: verify S{N} exit criteria
  - **Input**: outputs from all S{N} tasks
  - **Output**: integration verification report (pass/fail + bug list)
  - **Acceptance Criteria**:
    - Given all S{N} tasks are completed
    - When each exit criterion check is executed
    - Then all pass -> sprint closes; any failure -> bug is recorded
  - **Verification Notes**: execute checks item by item against exit criteria, confirm with screenshots/recordings/logs
  - **Estimate**: 2-4h
  - **Dependencies**: last task in S{N}
```

`INT` is the sprint closing gate. A sprint must not be marked complete before its `INT` task passes.

---

## Task Quality Rules

### Granularity

- keep single tasks in the 2h-2d range when possible; split further when over 2d
- merge tiny tasks when they are below roughly 2h

### Input/Output Traceability

> [!IMPORTANT]
> Task inputs and outputs must align.
>
> If Task B depends on Task A, Task B input must reference concrete artifacts from Task A output (file path, interface name, or data format).

### Acceptance Criteria

- default to Given / When / Then
- clear Done When lists are allowed only for pure technical foundation work (config / scaffolding)

---

## Output Quality Checklist

- both 05A and 05B generated
- every 05A task includes `Verification Reference` and `Evidence Output`
- 05B includes Task-by-Task plan and traceability matrix
- User Story Overlay is in 05A
- Contract Coverage Overlay, Testing Coverage Overlay, and Verification Traceability Matrix are in 05B
- smoke checks are centered on `INT-S{N}`
- no E2E abuse pattern
