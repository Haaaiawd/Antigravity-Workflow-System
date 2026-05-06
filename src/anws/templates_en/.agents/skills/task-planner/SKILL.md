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

Public contract coverage is mandatory whenever tasks create or modify externally observable behavior.

Rules:
- each public contract needs at least one implementation owner task
- each high-risk public contract needs at least one verification owner point
- implementation-only is not contract closure
- foundational low-dependency logic defaults to Unit Test ownership
- external interfaces (HTTP API / CLI API) default to explicit API Interface Functional Test evaluation
- error semantics and before/after data state are observable contract parts and cannot be skipped

---

## Output Quality Checklist

- both 05A and 05B generated
- every 05A task includes `Verification Reference` and `Evidence Output`
- 05B includes Task-by-Task plan and traceability matrix
- User Story Overlay is in 05A
- Contract Coverage Overlay, Testing Coverage Overlay, and Verification Traceability Matrix are in 05B
- smoke checks are centered on `INT-S{N}`
- no E2E abuse pattern
---
name: task-planner
description: Use WBS to decompose system design into executable tasks with traceability and verification ownership.
---

# Task Planning Master Manual

## Principles

- Decompose by System -> Phase -> Task
- Keep tasks practical (usually 2h-2d)
- Keep acceptance criteria explicit
- Keep verification type explicit
- Keep requirement and contract traceability explicit

## Verification types

- Unit Test
- API Interface Functional Test
- Integration Test
- E2E Test
- Smoke Test
- Regression Test
- Manual Verification
- Build Check
- Lint Check

## Verification selection

1. Pure/local logic, state transitions, exception handling -> Unit Test
2. Public API/CLI contracts and error semantics -> API Interface Functional Test
3. Cross-module/database/service collaboration -> Integration Test
4. End-user critical journey -> E2E or Manual
5. Milestone gate -> Smoke
6. Existing critical capability risk -> Regression

## Testing Standard method

### Unit Test coverage
- normal/boundary/invalid input
- state transitions
- exception handling stability

### API Interface Functional Test coverage
- normal request
- missing/malformed/permission-denied request
- expected error code/message
- before/after assertions for data-changing endpoints

### Anti-bloat rule
- use representative risk-based cases
- avoid Cartesian-product expansion

## Task output checklist

- unique task IDs
- explicit dependencies
- design references in each task input
- acceptance criteria in each task
- verification type and notes in each task
- public contract implementation + verification ownership
- 3.3.4 responsibilities mapped (unit + API functional)
---
name: task-planner
description: Use WBS to decompose system design into executable tasks with dependencies, traceability, acceptance criteria, and verification ownership.
---

# Task Planning Master Manual

You are the **Task Planning Master**.

Your goal is to convert design docs into a practical two-track plan (`05A_TASKS.md` + `05B_VERIFICATION_PLAN.md`) that is executable, verifiable, and traceable.

---

## Quick Start

1. Locate latest `.anws/v{N}`
2. Read required docs: PRD + Architecture
3. Read optional docs: ADR + System Design
4. Load testing constraints from workflow/ADR (including Testing Standard 3.3.4)
5. Decompose tasks with WBS
6. Assign lightest sufficient verification types
7. Output to `.anws/v{N}/05A_TASKS.md` and `.anws/v{N}/05B_VERIFICATION_PLAN.md`

---

## Core Principles

- WBS hierarchy: System -> Phase -> Task
- Task size target: 2h-2d for most tasks
- Verifiable acceptance criteria
- Requirement traceability (`[REQ-XXX]`)
- Public contract ownership (implementation + verification)

### Testing principles

- Prefer the lightest verification type that can prove completion
- Foundational logic defaults to unit tests
- Smoke tests default to `INT-S{N}` or milestone checkpoints
- Regression tests are targeted, not mandatory full-suite reruns
- Public APIs must explicitly evaluate API Interface Functional Tests
- 3.3.4 coverage closes risk categories, not test-count inflation

---

## Task Structure

```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: Task title
  - **Description**: what to build
  - **Input**: design references + predecessor outputs
  - **Output**: concrete deliverables
  - **Contract ownership**: implemented/verified contract, or "None"
  - **Reference**: ADR/System Design section
  - **Acceptance Criteria**:
    - Given ...
    - When ...
    - Then ...
    - (Done When allowed only for pure technical foundation tasks)
  - **Verification Type**: Unit Test | API Interface Functional Test | Integration Test | E2E Test | Smoke Test | Regression Test | Manual Verification | Build Check | Lint Check
  - **Verification Notes**: how to verify and evidence expectations
  - **Estimate**: Xh
  - **Dependencies**: Task IDs
  - **Priority**: P0/P1/P2
```

---

## Verification Type Selection

1. Local/pure logic, state transitions, exception handling -> Unit Test
2. Public API/CLI contracts, permission boundaries, error semantics, data-changing endpoints -> API Interface Functional Test
3. Cross-module/database/service collaboration -> Integration Test
4. Key end-user journey -> E2E Test or Manual Verification
5. Sprint milestone gate -> Smoke Test
6. Existing critical capability risk -> Regression Test
7. Infra/config/scaffolding -> Build/Lint/Manual checks

---

## Testing Standard 3.3.4 Methodology

### Unit Test coverage

- Normal input
- Boundary input
- Invalid input
- Critical state transitions (create/execute/fail/retry style)
- Exception handling (null/out-of-range/invalid-state)

### API Interface Functional Test coverage

- Normal request behavior
- Missing parameter
- Malformed parameter
- Permission denied
- Error code and error message semantics
- Before/after state assertions for data-changing endpoints

### Anti-bloat policy

- Use equivalence classes, boundary values, representative negative cases
- Prefer parameterized/table-driven patterns
- Avoid full combinatorial Cartesian-product test generation

---

## Contract Risk Coverage

When a task creates or changes public contracts, verification ownership is mandatory.

Public contracts include:
- operations
- cross-system interfaces
- HTTP APIs
- CLI command/parameter semantics
- config/file/state formats
- error semantics
- persistence structures

---

## Output Quality Checklist

- Unique task IDs
- Explicit dependencies
- Design references in each task input
- Acceptance criteria in each task
- Verification type + notes in each task
- Public contract implementation/verification ownership
- 3.3.4 responsibilities mapped (unit + API functional)
- No combinatorial test bloat pattern
---
name: task-planner
description: Decompose system design documents into hierarchical WBS tasks with dependency analysis, traceability, acceptance criteria, and verification ownership.
---

# Task Planning Master Manual

> "A task that cannot be verified is a task that never finishes.
> A task without context is a task that is never understood."

You are the **Task Planning Master**. Your job is to transform system design into an executable, hierarchical task list.

---

## Quick Start

1. Locate the latest `.anws/v{N}` version
2. Load required documents: Architecture Overview and PRD
3. Load optional documents: ADRs and System Design
4. Stop if required documents are missing
5. Load testing constraints from workflows, ADRs, quality gates, sprint boundaries, and Testing Standard 3.3.4
6. Decompose work with WBS
7. Assign the lightest sufficient verification type to every task
8. Save output to `.anws/v{N}/05A_TASKS.md` and `.anws/v{N}/05B_VERIFICATION_PLAN.md`

---

## Core Principles

> [!IMPORTANT]
> **Four task-planning principles**:
>
> 1. **Hierarchical WBS** - System -> Phase -> Task
> 2. **Atomicity** - prefer tasks sized 2h-2d
> 3. **Verifiability** - default to Given / When / Then; use clear Done When only for foundation tasks
> 4. **Traceability** - map every task to PRD requirements like `[REQ-XXX]`

> [!IMPORTANT]
> **Testing planning principles**:
>
> - Choose the **lightest sufficient** verification type
> - If the workflow or ADR defines a testing strategy, follow it first
> - Smoke tests default to `INT-S{N}` or rare milestone tasks
> - Regression tests are targeted re-checks only when existing critical capabilities may be affected
> - Foundational, shared, and pure logic defaults to unit tests, including main branches, boundary cases, and error paths
> - Public contracts require ownership: at least one implementation task and at least one verification point
> - Public API contracts must explicitly evaluate API interface functional tests: normal request, parameter error, permission denial, error code/message, and before/after state
> - Testing Standard 3.3.4 closes risk categories: normal, boundary, invalid, state transitions, exception handling, and interface error semantics; do not create combinatorial test bloat

Avoid:

- flat task lists
- oversized tasks such as "build the whole backend"
- microscopic tasks such as "write one line"
- missing acceptance criteria
- ignored dependencies

Prefer:

- three levels: System -> Phase -> Task
- task size around 2h-2d
- clear acceptance criteria
- complete metadata: ID, requirement, description, input, output, acceptance, verification, estimate, dependency, priority

---

## WBS Method

### Level 1: System

Group tasks by systems from the Architecture Overview.

```markdown
## System 1: Frontend UX System
## System 2: Backend API System
## System 3: Database System
```

Rules:

- each system maps to one Architecture Overview system
- order systems by dependency direction, with dependencies earlier

---

### Level 2: Phase

Group each system by implementation phase.

Standard phases:

1. **Foundation** - environment, project setup, dependencies
2. **Core** - main business logic
3. **Integration** - cross-system integration, API wiring
4. **Polish** - performance, error handling, test hardening

---

### Level 3: Task

Every task must cite design context. Do not invent work from memory.

Allowed input references:

- `02_ARCHITECTURE_OVERVIEW.md` section
- `01_PRD.md`
- `03_ADR/ADR-XXX.md`
- `04_SYSTEM_DESIGN/{system}.md` section

Task structure:

```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: Task title
  - **Description**: concise statement of what to do, not how to do it
  - **Input**: design document reference + previous task outputs, with at least one document reference
  - **Output**: deliverables
  - **Contract ownership**: public contract implemented or verified by this task; write "None" if not applicable
  - **Reference**: ADR-XXX or System Design section, if any
  - **Acceptance Criteria**:
    - Given [precondition]
    - When [action]
    - Then [expected result]
    - Use clear Done When items only for purely technical foundation tasks
  - **Verification Type**: Unit Test | API Interface Functional Test | Integration Test | E2E Test | Smoke Test | Regression Test | Manual Verification | Build Check | Lint Check
  - **Verification Notes**: how to confirm completion
  - **Estimate**: 2h, 6h, 1d, 2d
  - **Dependencies**: T{X}.{Y}.{Z}
  - **Priority**: P0 | P1 | P2
```

---

## Verification Type Selection

> [!IMPORTANT]
> **If the workflow does not provide stricter constraints, decide in this order.**

1. **Local logic / pure algorithms / data transforms / state transitions / exception handling** -> Unit Test
2. **HTTP API / CLI API / public interface contract / permission boundary / error semantics / data-changing endpoint** -> API Interface Functional Test
3. **Cross-module / database / multi-service collaboration** -> Integration Test
4. **Critical user-facing path** -> E2E Test or Manual Verification
5. **Sprint exit criteria / milestone gate** -> Smoke Test
6. **Change may affect completed critical capability** -> Regression Test
7. **Config, scaffolding, infrastructure** -> Build Check / Lint Check / Manual Verification

Selection details:

- Do not choose E2E merely because a task feels important
- If integration tests prove the requirement sufficiently, do not upgrade to E2E
- If the task exposes or modifies a public API, do not hide API functional responsibility inside generic integration testing
- Data-changing endpoints need before/after state or data assertions
- Auth, role, or permission changes need permission-denied scenarios
- Regression should reuse the smallest affected existing test set where possible

---

## Testing Standard 3.3.4 Methodology

> [!IMPORTANT]
> **3.3.4 requires a complete, executable, traceable testing plan. It does not require blindly increasing test count.**

Plan testing responsibilities by risk category.

### Unit Test Responsibilities

- **Core business calculation logic**: normal input, boundary input, invalid input
- **Critical state transitions**: creation, execution, failure, retry, and similar lifecycle states
- **Exception handling logic**: null values, out-of-range parameters, invalid states, correct error information, and stable behavior

### API Interface Functional Test Responsibilities

- **Normal requests**: core business APIs return correct responses for valid parameters
- **Invalid requests**: missing parameters, malformed parameters, permission denial, expected error codes, and expected error messages
- **Data changes**: create, update, delete, or equivalent endpoints verify system state or data results before and after the call

### Test Bloat Control

- Use equivalence classes, boundary values, representative invalid samples, parameterized tests, or table-driven tests
- Do not generate Cartesian products across every field and every error condition
- Unit tests handle fine-grained logic; API functional tests cover public contracts; E2E covers only key user flows

---

## Contract Risk Coverage

> [!IMPORTANT]
> **If a task creates or changes a public contract, assign explicit verification ownership.**

Public contracts include:

- operation contracts
- cross-system interfaces
- HTTP APIs
- CLI commands and parameter semantics
- config structures, file formats, and state formats
- error semantics and return structures
- persistence structures

Rules:

- every public contract has at least one implementation owner
- every high-risk public contract has at least one verification owner
- implementation alone does not close the contract
- foundational rule contracts should prefer unit tests over E2E
- HTTP APIs, CLI APIs, and other public interfaces should evaluate API Interface Functional Test ownership
- error codes, error messages, permission-denied semantics, and before/after state are observable contracts and must not be skipped

---

## Foundational Unit-Test Priority

> [!IMPORTANT]
> **For registries, manifests, parsers, planners, schemas, diff/merge, normalizers, selectors, and similar foundational logic, prefer unit-test tasks.**

- If shared by upper layers, unit tests are normally required
- If a sprint adds several foundational logic points, add unit-test ownership in the same or adjacent sprint

---

## Sprint and Smoke-Test Binding

> [!IMPORTANT]
> **Only generate milestone smoke tests when the workflow provides sprint roadmap or INT task semantics.**

- If `INT-S{N}` exists, bind smoke checks there first
- Do not generate smoke tests for every normal development task
- Without clear sprint or milestone boundaries, prefer unit, API functional, integration, or manual verification instead of invented smoke tasks

---

## Interface Traceability

> [!IMPORTANT]
> **Task inputs and outputs must align.**
>
> If task B depends on task A, B's input must cite A's concrete output: file path, interface name, data format, or equivalent artifact.

Good:

```text
B input = T1.1.1 output `App.tsx` component and `vite.config.ts` configuration.
```

Bad:

```text
B input = frontend project.
```

---

## Output Quality Checklist

- all tasks have unique IDs
- every task cites at least one design document input
- every task has acceptance criteria
- every task has a verification type and verification notes
- public contracts have implementation and verification ownership
- foundational logic has unit-test ownership when needed
- public APIs have API Interface Functional Test ownership when needed
- Testing Standard 3.3.4 responsibilities are closed by risk category
- test plans avoid combinatorial test bloat
- dependencies are explicit
- estimates are realistic
