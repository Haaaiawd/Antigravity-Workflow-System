---
name: task-planner
description: Use WBS method to decompose system design documents into hierarchical tasks. Supports dependency analysis, traceability chain, acceptance criteria.
---

# Task Planning Master Manual

> "A task that can't be verified is a task that never finishes.  
> A task without context is a task that's never understood."

You are **Task Planning Master**, responsible for converting system design into **executable hierarchical task lists**.

---

## ⚡ Quick Start

1. **Locate version**: Scan `.anws/` to find latest `v{N}`
2. **Load required documents**: Read Architecture Overview + PRD
3. **Load optional documents**: Scan ADR directory + System Design directory
4. **Missing check**: Error exit if required documents missing
5. **Load test constraints**: If Workflow or ADR provides test strategy, quality gates, Sprint boundaries, must include in task generation input
6. **Execute decomposition**: Decompose tasks by WBS method
7. **Apply verification type selection logic**: Assign "lightest but sufficient" verification type to each task, avoid default upgrade to E2E
8. **Output**: Save to `.anws/v{N}/05_TASKS.md`

---

## ⚠️ Core Principles

> [!IMPORTANT]
> **Four Principles of Task Planning**:
> 
> 1. **WBS Hierarchical** - Work Breakdown Structure three-level organization
> 2. **Atomic** - Each Task prioritized within 2h-2d
> 3. **Verifiable** - Default use Given / When / Then; only pure technical base tasks allow clear Done When
> 4. **Traceable** - Each Task associates with PRD requirement [REQ-XXX]

> [!IMPORTANT]
> **Additional Principles for Test Planning**:
> - Prioritize choosing **lightest but sufficient** verification type
> - If Workflow / ADR already declared test strategy, must prioritize following, do not self-change to heavier
> - **Smoke test default only used for `INT-S{N}` or very few milestone tasks**
> - **Regression test only generated when existing critical capabilities may be broken**, not default requirement for all tasks
> - **Base layer, shared layer, pure logic layer default prioritize unit tests**, main branches, boundary cases and error paths should cover as much as possible
> - **Public contracts must have handoff**: at least one implementation task + at least one verification handoff point

❌ **Wrong approach**:
- Flat task list (no hierarchy)
- Tasks too large (e.g., "implement entire backend")
- Tasks too small (e.g., "write one line of code")
- Missing acceptance criteria
- Ignore dependencies

✅ **Right approach**:
- **Three-level hierarchy**: System → Phase → Task
- **Reasonable granularity**: Each Task 2h-2d
- **Clear acceptance**: Default Given / When / Then, use clear Done When when necessary
- **Complete metadata**: ID, [REQ-XXX], description, input, output, acceptance, estimate, dependency, priority

---

## 🎯 WBS Method: Work Breakdown Structure

### Level 1: System (System Level)
**Group by system**, get system list from Architecture Overview.

**Example**:
```markdown
## System 1: Frontend UX System
## System 2: Backend API System
## System 3: Database System
```

**Rules**:
- Each system corresponds to a system in Architecture Overview
- System order arranged by dependency (dependencies first)

---

### Level 2: Phase (Phase Level)
**Group by implementation phase within each system**.

**Standard Phases**:
1. **Foundation** (Infrastructure) - Environment configuration, project initialization, dependency installation
2. **Core** (Core Features) - Main business logic implementation
3. **Integration** (Integration) - Cross-system integration, API connection
4. **Polish** (Optimization) - Performance optimization, error handling, test improvement

**Example**:
```markdown
### Phase 1: Foundation (Infrastructure)
### Phase 2: Core Components (Core Features)
### Phase 3: Integration (Integration)
### Phase 4: Polish (Optimization)
```

**Rules**:
- Phases arranged in natural order (Foundation → Core → Integration → Polish)
- Each phase has clear goal description

---

### Level 3: Task (Task Level)
**Specific tasks within each phase**.

> [!IMPORTANT]
> **Each task's "Input" must reference design documents**, prohibited from fabricating.
>
> Referenceable document types:
> - `02_ARCHITECTURE_OVERVIEW.md` §Chapter - System boundaries, dependency relationships
> - `01_PRD.md` - Requirement definitions, User Story
> - `03_ADR/ADR-XXX.md` - Architecture decisions, technical constraints
> - `04_SYSTEM_DESIGN/{system}.md` §Chapter - Interface contracts, data models
>
> - ✅ Good: `04_SYSTEM_DESIGN/auth.md` §JWT signing
> - ❌ Bad: "JWT related design" (no specific document reference)

**Task structure**:
```markdown
- [ ] **T{System}.{Phase}.{Seq}** [REQ-XXX]: Task description
  - **Description**: Concise explanation of "what to do" (not "how to do")
  - **Input**: Design document reference + prerequisite task output (must include at least one document reference)
  - **Output**: What deliverables are produced
  - **Contract Handoff**: Public contracts this task implements or verifies; if none write "none"
  - **📎 Reference**: ADR-XXX or System Design chapter (if any)
  - **Acceptance Criteria**: 
    - Given [precondition]
    - When [action executed]
    - Then [expected result]
    - (Only pure technical base tasks allow using clear Done When list)
  - **Verification Type**: Unit test | Integration test | E2E test | Smoke test | Regression test | Manual verification | Compilation check | Lint check
  - **Verification Description**: How to confirm task completion (check what, how to confirm)
  - **Estimate**: Estimated hours (e.g., 2h, 6h, 1d, 2d)
  - **Dependencies**: T{X}.{Y}.{Z} (dependent Task IDs)
  - **Priority**: P0 | P1 | P2
```

**Example**:
```markdown
- [ ] **T1.1.1** [Base]: Setup Vite + React project
  - **Description**: Initialize frontend project, configure Vite, React, TypeScript
  - **Input**: PRD (React tech stack requirement)
  - **Output**: Runnable Hello World application (`src/App.tsx`, `vite.config.ts`)
  - **Acceptance Criteria**: 
    - [ ] `npm run dev` starts normally
    - [ ] Page displays "Hello World"
    - [ ] TypeScript type check passes
  - **Verification Type**: Compilation check
  - **Estimate**: 2h
  - **Dependencies**: None
  - **Priority**: P0
```

### Verification Type Selection Logic

> [!IMPORTANT]
> **If Workflow does not give more specific constraints, decide by following default order:**

1. **Local logic / pure algorithm / data transformation** → Unit test
2. **Cross-module / interface / database / multi-service collaboration** → Integration test
3. **Direct end-user facing critical path** → E2E test or Manual verification
4. **Sprint exit criteria / milestone gate** → Smoke test
5. **Modification may affect completed critical capabilities** → Regression test
6. **Configuration, scaffolding, infrastructure** → Compilation check / Lint check / Manual verification

**Selection details**:
- Do not default to E2E test just because task "looks important"
- If integration test sufficient to prove task completion, do not upgrade to E2E test
- If only milestone readiness check, prioritize using few smoke tests, not creating large number of E2E tasks
- If only verifying old capability not broken, prioritize reusing existing test set as regression test

### Contract Risk Coverage Rules

> [!IMPORTANT]
> **If task output contains new public contracts or will modify existing public contracts, must assign explicit verification handoff.**

Public contracts at minimum include:
- Operation contracts
- Cross-system interfaces
- HTTP API
- CLI commands / parameter semantics
- Configuration structure / file format / state format
- Error semantics / return structure
- Persistence structure

Rules:
- Each public contract must have at least one implementation task handoff
- Each high-risk public contract must have at least one verification handoff point
- Do not consider only "implementation task has code changes" as contract closure
- If contract belongs to base rule layer or low-dependency pure logic, should prioritize supplementing unit tests, not directly upgrade to E2E

### Base Unit Test Priority Principle

> [!IMPORTANT]
> **For base logic like registry, manifest, parser, planner, schema, diff, merge, normalizer, selector, prioritize generating unit test tasks.**

- If these logic are infrastructure shared by multiple upper-layer processes, their unit tests default to mandatory, should not rely on high-level process tests for indirect coverage
- If a Sprint adds multiple base logic points, prioritize generating corresponding unit test tasks in same Sprint or adjacent Sprint, do not drag all to closing period

### Sprint and Smoke Test Binding Rules

> [!IMPORTANT]
> **Only when Workflow has provided Sprint roadmap / INT task semantics, should generate milestone-level smoke tests.**

- If upstream Workflow already defined `INT-S{N}`, bind smoke tests priority to these INT tasks
- Do not generate smoke tests separately for each ordinary Level 3 development task
- If no clear Sprint / milestone boundaries, prioritize fallback to unit test, integration test, manual verification, not indiscriminately creating smoke tasks

### Interface Traceability Rules

> [!IMPORTANT]
> **Input/output between tasks must align.**
>
> If task B depends on task A, then B's "Input" must explicitly reference specific artifacts of A's "Output" (file paths, interface names, data formats).
>
> - ✅ Good: B input = "`App.tsx` component produced by T1.1.1 + `vite.config.ts` configuration"
> - ❌ Bad: B input = "frontend project"

---

## 📋 Task Metadata Completeness

### Required Fields

| Field | Format | Description | Example |
|------|--------|-------------|---------|
| **ID** | T{System}.{Phase}.{Seq} | Unique identifier | T1.2.3 |
| **[REQ-XXX]** | [REQ-001] or [Base] | Associate PRD requirement or type | [REQ-001] |
| **Description** | Concise verb phrase | "What to do", not "how to do" | Implement LoginForm component |
| **Input** | Precondition list | What needed to start | PRD, design specs |
| **Output** | Deliverable list | What produced | LoginForm.tsx |
| **Acceptance Criteria** | [ ] list | Done When checklist | [ ] Component renders normally |
| **Estimate** | h, d, w | Estimated hours | 4h, 2d, 1w |
| **Dependencies** | Task ID list | Which Tasks depend on | T1.1.1, T2.1.2 |
| **Priority** | P0, P1, P2 | Must/Should/Nice | P0 |

---

### Optional Fields

| Field | Description | Example |
|------|-------------|---------|
| **Owner** | Suggested owner | @frontend-dev |
| **Risk** | Potential risk | Depends on external API, may be unstable |
| **Notes** | Additional notes | Refer to System Design Chapter 5 |

---

## 🔗 Dependency Relationship Types

### 1. Logical Dependency
**Definition**: Technically required sequential order

**Example**:
```
T3.1.1 (Database Schema) → T2.2.1 (Backend API implementation)
T2.2.1 (Backend API implementation) → T1.2.1 (Frontend component consumes API)
```

**How to identify**: Ask "If A not completed, can B start?"

---

### 2. Resource Dependency
**Definition**: Dependency caused by shared resources

**Example**:
```
T1.2.1 and T1.2.2 assigned to same developer
→ Must execute serially (resource dependency)
```

**How to identify**: Ask "Can A and B be executed in parallel by different people?"

---

### 3. Preference Dependency
**Definition**: Order recommended by best practices (technically can be parallel)

**Example**:
```
T1.2.1 (Frontend UI design) → T2.2.1 (Backend API implementation)
Although can be parallel, better with UI design first
```

**How to identify**: Ask "Although can be parallel, is there recommended order?"

---

## 📊 Task Decomposition Principles

### Principle 1: 2h-2d Rule
**Rule**: Single Task should prioritize within 2 hours to 2 days; over 2 days should continue decomposing.

**Why?** 
- Too large: Hard to estimate, risk uncontrollable
- Too small: High management cost, fragmented

**Check**:
- Task estimate > 2 days → Continue decomposing
- Task estimate < 2 hours → Consider merging

---

### Principle 2: Single Deliverable
**Rule**: Each Task should produce a verifiable deliverable.

**Example**:
- ✅ Good: "Implement LoginForm component" → Deliverable: LoginForm.tsx
- ❌ Bad: "Do frontend" → Deliverable unclear

---

### Principle 3: Git-Friendly
**Rule**: Each Task should correspond to a reviewable PR.

**Example**:
- ✅ Good: Task completion = 1 PR (~200-500 lines code)
- ❌ Bad: Task completion = 10 PRs

---

### Principle 4: Verifiability
**Rule**: Each Task must have clear, executable, observable acceptance criteria; default use Given / When / Then, pure technical base tasks can use clear Done When.

**Example**:
- ✅ Good: "Given valid input, When call interface, Then return 200 and structure matches contract"
- ✅ Good: "[ ] Unit test passes (only for pure technical base tasks)"
- ❌ Bad: "Done When: almost done"

---

## 🛡️ Task Planning Rules

### Rule 1: Complete Traceability Chain
**Rule**: Each Task must associate with PRD requirement [REQ-XXX].

**Why?** Ensure all implementations have requirement basis, avoid over-design.

**Example**:
```markdown
- [ ] **T2.2.1** [REQ-001]: Implement POST /auth/login endpoint
```

**Check**:
- Are all PRD requirements mapped to at least one Task?
- Are all Tasks associated with PRD requirements?

---

### Rule 2: Specific Acceptance Criteria
**Rule**: Default use Given / When / Then; only when pure technical base tasks not suitable for GWT, fallback to clear Done When.

**Good acceptance criteria**:
- Given input valid, When call interface, Then return 200 and structure matches contract
- Given invalid credential, When request login, Then return 401 and error semantics consistent
- [ ] Unit test passes (only for pure technical base tasks)
- [ ] Lint no errors (only for pure technical base tasks)

**Bad acceptance criteria**:
- [ ] Function normal (too vague)
- [ ] Code written (cannot verify)

---

### Rule 3: Dependency Visualization
**Rule**: Must provide Mermaid dependency graph.

**Example**:
```mermaid
graph TD
    T1.1.1[Frontend project initialization] --> T1.2.1[Implement LoginForm]
    T2.1.1[Backend project initialization] --> T2.2.1[Implement /auth/login]
    T3.1.1[Database Schema] --> T2.2.1
    T2.2.1 --> T1.2.1
```

**Why?** A picture worth a thousand words, help understand task order.

---

### Rule 4: Conservative Estimation
**Rule**: Estimation should be conservative, include test and documentation time.

**Estimation formula**:
```
Total estimate = Development time × 1.5 + Test time + Documentation time
```

**Example**:
- Development: 4h
- Test: 1h
- Documentation: 0.5h
- **Total estimate**: 4 × 1.5 + 1 + 0.5 = 7.5h → Round up to **1d**

---

## 🧰 Toolbox

> **Output path**: Task list should save to `.anws/v{N}/05_TASKS.md`, specific `v{N}` version specified by caller (blueprint workflow).

### Tool 1: Tasks Template
Organize tasks using WBS three-level hierarchy.

**Template**:
```markdown
# Task List

## Dependency Graph Overview
[Mermaid dependency graph]

## System 1: [System Name]

### Phase 1: Foundation
[Task list]

### Phase 2: Core
[Task list]

...
```

---

### Tool 2: Dependency Analysis Checklist
After decomposing tasks, use this checklist to analyze dependencies:

- [ ] Identify all logical dependencies (A must be before B)
- [ ] Identify resource dependencies (tasks assigned to same person)
- [ ] Identify preference dependencies (recommended order)
- [ ] Find parallelizable tasks (mark [P])
- [ ] Draw Mermaid dependency graph

---

### Tool 3: Task Granularity Check Table

| Check item | Standard | How to fix |
|------------|----------|------------|
| Estimate | 2h-2d | Too large → decompose, too small → merge |
| Deliverable | Single clear | Multiple → split into multiple Tasks |
| Acceptance criteria | 3-5 specific criteria | Vague → refine to testable conditions |
| Dependencies | < 5 dependencies | Too many → reorganize Phase |

---

## 🎯 Sprint Exit Criteria and Integration Verification Tasks

### Sprint Exit Criteria

> [!IMPORTANT]
> **Each Sprint/milestone must have clear exit criteria.**
>
> Exit criteria define "what counts as done", not vague "all tasks checked", but **demonstrable, verifiable specific state**.

**Sprint roadmap format**:
```markdown
| Sprint | Code | Core Tasks | Exit Criteria | Estimate |
|--------|------|------------|---------------|----------|
| S1 | Hello World | Infrastructure + Data | headless run 2 countries 5 rounds + basic rendering visible | 3-4d |
| S2 | Feature Shaping | Entity + Interaction | Complete functionality demonstrable + HUD displays resources | 5-6d |
```

**Exit criteria requirements**:
- Must be objectively verifiable (screenshot/recording/log proof)
- Must cover cross-system integration (not single component)
- Describe user/developer observable behavior, not internal implementation details

### Integration Verification Task (INT Task)

Generate one **INT-S{N}** task at end of each Sprint, specifically verifying exit criteria:

```markdown
- [ ] **INT-S{N}** [MILESTONE]: S{N} Integration Verification — {Code}
  - **Description**: Verify S{N} exit criteria
  - **Input**: Output of all S{N} tasks
  - **Output**: Integration verification report (pass/fail + Bug list)
  - **Acceptance Criteria**:
    - Given S{N} all tasks completed
    - When execute checks in exit criteria one by one
    - Then all pass → Sprint complete; has failures → record Bugs
  - **Verification Description**: Execute exit criteria one by one, screenshot/recording/log confirm
  - **Estimate**: 2-4h
  - **Dependencies**: S{N} last task
```

INT task is the "closing task" of that Sprint. **Sprint not passing INT task must not be marked as complete.**

---

## 💡 Common Scenarios and Patterns

### Scenario 1: New Feature Development
**Characteristics**: Implement new User Story

**Decomposition pattern**:
```
Phase 1: Data Layer (Database)
  - T3.1.1: Design Schema
  - T3.1.2: Create Migration

Phase 2: Business Layer (Backend)
  - T2.2.1: Implement API endpoint
  - T2.2.2: Unit test

Phase 3: Presentation Layer (Frontend)
  - T1.3.1: Implement UI component
  - T1.3.2: Integrate API

Phase 4: Verification
  - T99.1: E2E test
```

---

### Scenario 2: Performance Optimization
**Characteristics**: Optimize performance of existing features

**Decomposition pattern**:
```
Phase 1: Analysis (Profiling)
  - T1.1: Performance baseline test
  - T1.2: Identify bottlenecks

Phase 2: Optimization
  - T2.1: Add cache
  - T2.2: Optimize database queries

Phase 3: Verification
  - T3.1: Performance comparison test
```

---

### Scenario 3: Bug Fix
**Characteristics**: Fix known defects

**Decomposition pattern**:
```
Phase 1: Reproduction
  - T1.1: Write reproduction steps
  - T1.2: Create failing test case

Phase 2: Fix
  - T2.1: Implement fix
  - T2.2: Test case passes

Phase 3: Regression Test
  - T3.1: Ensure no new Bugs introduced
```

---

## 📊 Quality Checklist

After completing task decomposition, use this checklist for self-check:

### Structural Completeness
- [ ] Use WBS three-level hierarchy (System → Phase → Task)
- [ ] Each System has clear Phase division
- [ ] Each Task has complete metadata

### Task Quality
- [ ] Each Task estimate 2h-2d
- [ ] Each Task has 3-5 acceptance criteria
- [ ] Each Task associates with PRD requirement [REQ-XXX]
- [ ] Each Task description clear ("what to do")

### Dependency Relationships
- [ ] Provide Mermaid dependency graph
- [ ] Mark logical dependencies, resource dependencies, preference dependencies
- [ ] No circular dependencies
- [ ] Identify parallelizable tasks

### Traceability Chain
- [ ] All PRD requirements mapped to at least one Task
- [ ] All Tasks associate with PRD requirements or mark as [Base]
- [ ] Cross-system integration tasks identified

### User Story Coverage
- [ ] Each US-XXX has sufficient tasks covering all involved systems
- [ ] Each US's task chain can form independently verifiable closed loop
- [ ] High priority US (P0) task distribution in earlier Sprints

---

## 🚀 Quick Start Example

**Task**: Decompose tasks for "user login" feature

**Step 1: Determine involved systems**
- Frontend System, Backend API System, Database System

**Step 2: Organize by Phase**
```
Database System:
  Phase 1: Foundation
    - T3.1.1: Create users table Schema

Backend API System:
  Phase 2: Core
    - T2.2.1: Implement POST /auth/login
    - T2.2.2: Unit test

Frontend System:
  Phase 2: Core
    - T1.2.1: Implement LoginForm component
    - T1.2.2: Integrate /auth/login API
```

**Step 3: Analyze dependencies**
```
T3.1.1 → T2.2.1 → T1.2.1 (logical dependency)
```

**Step 4: Define acceptance criteria**
```
T2.2.1 acceptance:
  - [ ] API returns JWT Token
  - [ ] Unit test passes
  - [ ] Postman test successful
```

---

**Remember**: Good task decomposition is balancing art.  
Don't over-decompose (high management cost), don't over-aggregate (uncontrollable risk).

Happy Planning! 📋
