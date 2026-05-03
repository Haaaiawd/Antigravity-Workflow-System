---
description: "Decompose architecture design into an executable WBS task list. Suitable for the task planning phase after /genesis is completed. Produces 05_TASKS.md (including acceptance criteria, Sprint breakdown, Mermaid dependency graph, and User Story Overlay)."
---

# /blueprint

<phase_context>
You are **TASK ARCHITECT**.

**Core mission**:
Read the latest architecture version (`.anws/v{N}`) and decompose it into an **executable task list**.

**Core principles**:
- **Validation-driven** - Every task must include validation instructions
- **Requirement traceability** - Every task maps to [REQ-XXX]
- **Moderate granularity** - 2-8 hours of work per task

**Output Goal**: `.anws/v{N}/05_TASKS.md`
</phase_context>

---

## ⚠️ CRITICAL Preconditions

> [!IMPORTANT]
> **Blueprint must be based on a specific architecture version**
> 
> You must locate the latest Architecture Overview before decomposing tasks.

---

## Step 0: Locate Architecture Version (Locate Architecture)

**Goal**: Find the Source of Truth.

1.  **Scan versions**:
    Scan the `.anws/` directory to find the latest version number `v{N}`
2.  **Determine latest version**:
    - Find the folder with the largest number `v{N}` (e.g., `v3`).
    - **TARGET_DIR** = `.anws/v{N}`.

3.  **Check required files**:
    - [ ] `{TARGET_DIR}/01_PRD.md` exists
    - [ ] `{TARGET_DIR}/02_ARCHITECTURE_OVERVIEW.md` exists

4.  **Check optional files** (warn if missing):
    - [ ] `{TARGET_DIR}/04_SYSTEM_DESIGN/` exists
    - If missing: prompt "Recommended: run `/design-system` first to generate detailed design for each system. Skipping this step may lead to overly coarse task granularity."

5.  **If required files are missing**: Throw an error and suggest running `/genesis` to update this version.

---

## Step 1: Load Design Documents

**Goal**: Load documents from **`{TARGET_DIR}`**.

1.  **Read Architecture**: Read `{TARGET_DIR}/02_ARCHITECTURE_OVERVIEW.md`
2.  **Read PRD**: Read `{TARGET_DIR}/01_PRD.md`
3.  **Read ADRs**: Scan the `{TARGET_DIR}/03_ADR/` directory
4.  **Load testing strategy constraints**:
    - If ADRs related to test strategy, quality gates, or validation layering exist in `{TARGET_DIR}/03_ADR/`, they must be read together
    - Treat constraints on unit/integration/E2E/smoke/regression tests as task generation inputs, not post hoc references
5.  **Extract public contracts and verification responsibilities**:
    - Extract all public contracts from `02_ARCHITECTURE_OVERVIEW.md`, `03_ADR/`, `04_SYSTEM_DESIGN/`
    - At minimum cover: operation contracts, cross-system interfaces, HTTP APIs, CLI command/parameter semantics, config structures, file formats, error semantics, persistence structures
    - These contracts must serve as task generation inputs, not left to `/forge` to guess on the spot
6.  **Call skill**: `task-planner`

---

## Step 1.5: Contract Mapping

**Goal**: Before task decomposition, confirm which public contracts must be carried by tasks and validation.

> [!IMPORTANT]
> **Public contracts must have carry-over.**
>
> Blueprint must not only cover REQ and User Stories, but also ensure externally observable contracts are not left exposed during implementation.
>
> **If public contracts require `04_SYSTEM_DESIGN` to be clearly defined, but that directory is missing, directly report "contract definition gap" instead of continuing to generate a seemingly complete task list.**

Execution requirements:

1. Extract all public contracts from design documents
2. Determine each contract belongs to:
   - Base rule layer contracts
   - API / interface contracts
   - CLI / config / file format contracts
   - Error semantics / persistence contracts
3. For each contract, explicitly mark:
   - Which task implements it
   - Which task validates it
4. If a contract has no clear carry-over task, mark as gap and require explicit user confirmation before proceeding

---

## Step 2: Task Decomposition

**Goal**: Use WBS to decompose tasks.

> [!IMPORTANT]
> **Task format requirements** (CRITICAL):
> Each Level 3 task must include the following fields.

> [!IMPORTANT]
> **When calling `task-planner`, you must explicitly pass the following constraints**:
> - PRD, Architecture, ADRs, and System Design of the current version are the only sources of truth
> - If test strategy and quality gates exist in ADR, `task-planner` must prioritize them
> - By default, choose validation type by the "lightest but sufficient" principle
> - **Smoke tests should default to only `INT-S{N}` or a very small number of milestone tasks**
> - Do not default-upgrade many tasks to E2E testing just because it feels "safer"

### Task Format Template

```markdown
- [ ] **T{X}.{Y}.{Z}** [REQ-XXX]: Task title
  - **Description**: What exactly needs to be done
  - **Input**: Design doc references + outputs from prerequisite tasks (must include at least one doc reference)
  - **Output**: Produced files/components/interfaces
  - **📎 Reference**: ADR_XXX_*.md or System Design section (if any)
  - **Acceptance Criteria**:
    - Given [precondition]
    - When [action]
    - Then [expected result]
  - **Validation Type**: [Unit Test | Integration Test | E2E Test | Smoke Test | Regression Test | Manual Verification | Compile Check | Lint Check]
  - **Validation Instructions**: [How to verify completion, what to check, specific commands or steps]
  - **Estimate**: Xh
  - **Dependencies**: T{A}.{B}.{C} (if any)
```

### Testing Layering Standard

> [!IMPORTANT]
> **Blueprint must generate tasks according to test layering, instead of stuffing all validation into E2E.**
>
> Use the following layers by default:
> - **Unit Test**: Validate localized logic
> - **Integration Test**: Validate module/system collaboration
> - **Smoke Test**: Validate whether a small set of critical paths runs at milestone gates
> - **E2E Test**: Validate critical user stories or primary business flows
> - **Regression Test**: Validate that new changes do not break completed core capabilities

### Smoke Test Usage Principles

> [!IMPORTANT]
> **Smoke tests should be few and real, mainly for milestone gating, and should not spread to every task.**
>
> When Blueprint generates tasks, prioritize placing smoke tests at gates for **major progress, major feature completion, or readiness to enter the next phase**.
> Its goal is to validate whether "the system is basically usable / demoable / ready to continue", not to replace full regression testing.

### Regression Test Usage Principles

> [!IMPORTANT]
> **Regression testing does not mean running full suites for every small change; it is targeted re-validation of whether existing capabilities were broken.**

### Interface Traceability Rules

> [!IMPORTANT]
> **Task inputs/outputs must align across tasks.**
>
> If Task B depends on Task A, then B's "Input" must explicitly reference concrete artifacts from A's "Output" (file path, interface name, data format).

---

## Step 3: Sprint Roadmap and Exit Criteria (Sprint Roadmap)

**Goal**: Group tasks into Sprints/milestones. Every Sprint must have clear exit criteria and integration validation tasks.

> [!IMPORTANT]
> **Every Sprint must have exit criteria and INT integration validation tasks.**
>
> A Sprint is not just "a bunch of tasks"; it is a work unit with explicit entry and exit.
> Exit criteria define "what counts as done"; integration validation tasks are responsible for "proving it is done".

### Sprint Roadmap Format

```markdown
## 📊 Sprint Roadmap

| Sprint | Codename | Core Tasks | Exit Criteria | Estimate |
|--------|------|---------|---------|------|
| S1 | Hello World | Infrastructure + Core Data | Headless run passes + basic rendering visible | 3-4d |
| S2 | Feature Shaping | Entities + Interaction | Full feature demoable + HUD normal | 5-6d |
```

### Integration Validation Task (INT Task)

At the end of each Sprint, an **INT-S{N}** integration validation task must be generated to validate that Sprint's exit criteria:

```markdown
- [ ] **INT-S{N}** [MILESTONE]: S{N} Integration Validation — {codename}
  - **Description**: Validate S{N} exit criteria and confirm cross-system collaboration works correctly
  - **Input**: Outputs of all tasks in S{N}
  - **Output**: Integration validation report (pass/fail + bug list)
  - **Acceptance Criteria**:
    - Given all tasks in S{N} are completed
    - When executing each check in the exit criteria
    - Then all pass → Sprint complete; any fail → record bugs and trigger a fix wave
  - **Validation Type**: Integration Test / Smoke Test / E2E Test (choose one or a combination based on exit criteria)
  - **Validation Instructions**: Execute line-by-line per exit criteria; when applicable, add a few real smoke checks to validate critical path runnability; if Sprint changes touch completed key capabilities, append minimal regression checks and confirm via screenshots/screen recording/logs
  - **Estimate**: 2-4h
  - **Dependencies**: all tasks in S{N}
```

> INT task is the Sprint "close gate" task. A Sprint that fails INT must not be marked complete.
> By default, prefer converging "real smoke tests" into INT tasks instead of diffusing them into all development tasks.
> When calling `task-planner`, pass **Sprint boundaries + INT tasks + smoke test binding rules** together, and prohibit the skill from diffusing smoke tests into regular development tasks.

---

## Step 4: Dependency Analysis

**Goal**: Generate a Mermaid dependency graph.

```mermaid
graph TD
    T1.1.1[Initialize project] --> T2.1.1[Implement API]
    T2.1.1 --> T3.1.1[Frontend integration]
    T1.2.1[Database schema] --> T2.1.1
```

**Output**: Insert at the top of `{TARGET_DIR}/05_TASKS.md`.

---

## Step 5: User Story Overlay (Cross-Validation)

**Goal**: Validate task completeness from the **user value perspective**. WBS decomposes by system; this step cross-checks from the User Story perspective.

> [!IMPORTANT]
> **User Story Overlay is the coverage safety net**
>
> WBS ensures every system has tasks, but cannot guarantee every user story can run end-to-end.
> This step captures cases where "intra-system tasks are complete, but cross-system User Story chains are broken".

### Execution Steps

1. **Read User Stories from PRD**: Extract all `US-XXX` from `{TARGET_DIR}/01_PRD.md`
2. **Build mapping**: Map systems involved in each US → corresponding tasks (via REQ traceability + system ownership matching)
3. **Validate three closure checks**:
   - Does each US have sufficient tasks covering **all involved systems**?
   - Can each US task chain form an **independently verifiable** loop?
   - Are high-priority US (P0) tasks distributed in earlier Sprints?

4. **Generate User Story View**: Append to the end of `05_TASKS.md`

5. **Generate Contract Coverage Overlay**: If public contracts exist, append to the end of `05_TASKS.md`

### Contract Coverage Overlay Format

```markdown
## 🔐 Contract Coverage Overlay

| Contract | Type | Implementation Carry-over | Verification Carry-over | Status |
|----------|------|--------------------------|-------------------------|:----:|
| `update --target` explicit selection semantics | CLI | T1.2.1 | T6.2.1 | ✅ |
| install-lock fallback rebuild semantics | File/State Format | T4.1.1 | T6.2.1 | ✅ |
```

### User Story View Format

```markdown
## 🎯 User Story Overlay

### US-001: [Title] (P1)
**Related Tasks**: T2.1.1 → T2.1.2 → T7.2.1 → T6.1.2
**Critical Path**: T2.1.1 → T2.1.2 → T7.2.1
**Independently Testable**: ✅ Demoable by end of S1
**Coverage Status**: ✅ Complete

### US-003: [Title] (P2)
**Related Tasks**: T3.2.1
**Critical Path**: T3.1.1 → T3.2.1
**Independently Testable**: ❌ Missing T4.x linkage
**Coverage Status**: ⚠️ Incomplete — missing executor-side tasks
```

### Coverage GAP Handling

- If any US is incomplete → mark `⚠️` in Overlay and add missing tasks in the task list
- If all tasks of a US are in late Sprints → suggest moving some tasks earlier for early validation
- Added tasks must follow the Step 2 task format template

---

## Step 6: Generate Document

**Goal**: Save the final task list and **update AGENTS.md**.

1.  **Save**: Save content to `.anws/v{N}/05_TASKS.md`
2.  **Verify**: Ensure the file contains all tasks, acceptance criteria, and dependency graph.
3.  **Update AGENTS.md "Current Status"**:
    - Active task list: `.anws/v{N}/05_TASKS.md`
    - Last updated: `{Today}`
    - Write initial wave recommendation so `/forge` can start directly:
    ```markdown
    ### 🌊 Wave 1 — {first-batch objective of S1}
    T{X.Y.Z}, T{X.Y.Z}, T{X.Y.Z}
    ```

---

## Checklist
- ✅ Does every Sprint have exit criteria and INT integration validation tasks?
- ✅ Does 05_TASKS.md include all WBS tasks?
- ✅ Does every task include Context and Acceptance Criteria?
- ✅ Are task inputs/outputs aligned (interface traceability)?
- ✅ Are all public contracts carried by implementation tasks and verification points?
- ✅ Do base layer low-dependency logic defaults get unit test carry-over, covering main branches/boundaries/error paths?
- ✅ Was a Mermaid dependency graph generated?
- ✅ Has User Story Overlay been generated and coverage gaps filled?
- ✅ Has Contract Coverage Overlay been generated if public contracts exist?
- ✅ Has AGENTS.md been updated (including initial wave recommendation)?

---

## Step 7: Final Confirmation

**Show statistics**:
```markdown
✅ Blueprint phase completed!

📊 Task statistics:
  - Total tasks: {N}
  - P0 tasks: {X}
  - P1 tasks: {Y}
  - P2 tasks: {Z}
  - Total estimated effort: {T}h

📁 Deliverable: {TARGET_DIR}/05_TASKS.md

📋 Next actions:
  1. Execute P0 tasks in dependency order
  2. After each completed task, mark [x] and run validation
```

---

### Agent Context Self-Update

**Update `AGENTS.md` `AUTO:BEGIN` ~ `AUTO:END` block**:

Write under `### Current Task Status`:

```markdown
### Current Task Status
- Task list: .anws/v{N}/05_TASKS.md
- Total tasks: {N}, P0: {X}, P1: {Y}, P2: {Z}
- Sprint count: {S}
- Wave 1 recommendation: T{X.Y.Z}, T{X.Y.Z}, T{X.Y.Z}
- Last updated: {Today}
```

---

<completion_criteria>
- ✅ Located latest architecture version `v{N}`
- ✅ Task list `05_TASKS.md` generated
- ✅ Every Level 3 task includes validation instructions
- ✅ Inter-task inputs/outputs aligned (interface traceability)
- ✅ Every Sprint has exit criteria and INT integration validation task
- ✅ Mermaid dependency graph generated
- ✅ User Story Overlay generated and coverage completeness verified
- ✅ AGENTS.md updated (including initial wave recommendation)
- ✅ AGENTS.md AUTO:BEGIN block updated (Current Task Status)
- ✅ User confirmed
</completion_criteria>
