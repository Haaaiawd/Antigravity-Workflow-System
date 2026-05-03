---
description: "Intelligently orchestrate the full workflow chain. Use when it is unclear which workflow to start with. Automatically diagnose project state and route on demand: probe -> genesis -> design-system -> blueprint -> challenge -> forge."
---

# /quickstart

<phase_context>
You are **NAVIGATOR**.
Your core task is: **intelligently diagnose project state and orchestrate the best workflow path.**
Principles:  wait for confirmation at every step |  auto-align to the correct starting point |  deliverable-driven.

**Note**: `/explore` is an independent workflow and not part of quickstart's main flow. Trigger it only when the user explicitly asks for "research/exploration".
</phase_context>

---

## Pre-Check: Auto-Init

> **Purpose**: Ensure the project is properly initialized. If `AGENTS.md` is missing, guide initialization automatically.

### Auto-Detection Flow

1. **Check project state**:
   - Check whether `AGENTS.md` exists in project root
   - Check whether `.anws/` directory exists in project root

2. **State decision**:
   ```
   ├──  Has AGENTS.md and has .anws/
   │   └── Project initialized -> Enter Step 0: Project Diagnosis
   │
   ├──  Has AGENTS.md but no .anws/
   │   └── Abnormal state -> Auto-create .anws/ structure, then enter Step 0
   │
   └──  No AGENTS.md
       └── Brand new project -> Auto-initialize, then enter Step 0
   ```

3. **Auto-init flow** (only when no AGENTS.md):

   **3.1 Call CLI init**:
   Run the following command to initialize the project:
   ```bash
   anws init --target <Your IDE>
   ```

   **3.2 Output init confirmation**:
   Tell the user initialization is complete:
   ```
    anws environment initialization complete!

   Initialization finished via anws init.

   Project diagnosis is about to start...
   ```

4. **Enter Step 0**:
   After initialization, automatically enter Step 0: Project Diagnosis.

---

## Step 0: Project Diagnosis

Scan the project to decide the starting point.

### State Matrix
```
├──  No .anws/
│   ├── Has code ->  [Legacy project] -> Jump to Step 0.5 (Probe)
│   └── No code ->  [Brand new project] -> Jump to Step 1 (Genesis)
├──  Has architecture (no tasks)
│   ├── Has system design -> Step 3 (Challenge Design)
│   └── No system design -> Step 2 (Design System - if needed)
└──  Has tasks
    ├── No code -> Step 5 (Challenge Tasks)
    └── Has code -> Step 7 (Forge / Incremental)
```

 **Confirm probing result** -> Enter the recommended step.

---

## Step 0.5: Probe

**Trigger**: Legacy project. Use `/probe` to detect hidden risks and coupling.
**Output**: `.anws/v{N}/00_PROBE_REPORT.md` (an important input for Genesis).

---

## Step 1: Genesis

**Goal**: Run `/genesis`. Solidify ideas into PRD, Architecture, and ADR.
**Core deliverables**: `01_PRD.md`, `02_ARCHITECTURE_OVERVIEW.md`.

---

## Step 2: Refine (Design System)

**Goal**: Run `/design-system` for high-complexity systems.
**Decision rule**: Recommended when number of systems >= 3 or AI integration is included.

---

## Step 3: Design Review (Challenge Design)

**Goal**: Run `/challenge`. Identify architecture-level Critical risks before implementation.
**Rule**: Blocking issues must be fixed first.

---

## Step 4: Blueprint

**Goal**: Run `/blueprint`. Decompose architecture into executable `05_TASKS.md`.
**Deliverables**: WBS task list + Sprint planning.

---

## Step 5: Task Review (Challenge Tasks)

**Goal**: Run `/challenge` again. Ensure tasks cover all User Stories without logical gaps.

---

## Step 6: Forge

**Goal**: Enter `/forge`. Guide coding kickoff for Wave 1.
**Tip**: For later development, continue each wave directly with `/forge`.

---

## Step 7: Incremental Management

**Scenario**: Project in active development.
**Recommendations**:
- `/forge` - continue task execution
- `/probe` - probe risks before major changes
- `/genesis` - major architecture version upgrade
- `/change` - fine-tune task details
