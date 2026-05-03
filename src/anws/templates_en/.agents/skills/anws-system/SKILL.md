---
name: anws-system
description: Use when users in a skills-only environment need to decide which anws workflow to start from, or need routing among forge / change / genesis / probe / blueprint / challenge / upgrade. It is the navigation entry for the anws workflow set.
---

# ANWS System Router Manual

You are the **ANWS Router**.

Your responsibility is not to replace all workflows directly, but to serve as the unified navigation entry in **skills-only mode**:

- Decide which workflow the current request should route to
- Tell the model which `references/*.md` still need to be read
- Clarify permission boundaries before execution to avoid mixing `/forge`, `/change`, and `/genesis`

## Activation Rules

Use this skill when any of the following applies:

1. The user does not know which workflow to start with
2. The user explicitly mentions workflows like `/quickstart`, `/forge`, `/change`, `/genesis`, but the current environment only has skills
3. The user asks "which process should we follow next"
4. The request spans multiple phases (design, tasking, implementation) and phase boundaries must be identified first

## Mandatory Steps on First Activation

1. Read `references/quickstart.md` first
2. Judge which scenario the current request is closest to
3. Then read corresponding workflow references as needed
4. Before finishing required references, do not directly execute write operations of that workflow

## Workflow Map

- `references/quickstart.md`
  - Purpose: global entry. Determine current project stage and which workflow to call first
- `references/probe.md`
  - Purpose: system risk probing before taking over legacy projects or major changes
- `references/genesis.md`
  - Purpose: new project, major refactor, architecture upgrade, or when a new version is needed
- `references/design-system.md`
  - Purpose: add detailed design docs for a single system
- `references/blueprint.md`
  - Purpose: decompose architecture design into executable `05_TASKS.md`
- `references/challenge.md`
  - Purpose: systematically challenge design or task list before coding
- `references/forge.md`
  - Purpose: execute coding tasks according to `05_TASKS.md`, and maintain Wave progress
- `references/change.md`
  - Purpose: only fine-tune existing task definitions; do not create new tasks; do not advance implementation status
- `references/explore.md`
  - Purpose: research, explore, diverge and converge solution options
- `references/craft.md`
  - Purpose: create new workflows, skills, or prompts
- `references/upgrade.md`
  - Purpose: handle upgrade orchestration after `anws update`

## Routing Rules

### Route 1: Uncertain starting point

If the user does not know where to start, or you are unsure about the current stage:

1. Read `references/quickstart.md`
2. Determine the entry point based on project status
3. Recommend a workflow and explain why
4. Wait for user confirmation

### Route 2: Request is "start coding / continue implementation / do current wave"

1. Read `references/forge.md`
2. Check whether `.anws/v{N}/05_TASKS.md` exists and tasks are defined
3. If task list is missing, do not implement directly; return to `blueprint` or `genesis`
4. If tasks include **E2E / browser-assisted manual validation**: read the **`e2e-testing-guide`** skill under `skills/e2e-testing-guide/SKILL.md` (paths follow the target IDE projection).
5. Before commit when **static contract fidelity** is required: read **`code-reviewer`**. **If the host supports subagents** (Task, parallel agents, etc.), **prefer delegating** that skill to a subagent (same checklist and outputs). **If not**, run **`code-reviewer` in this session**—requirements do not shrink.

### Route 3: Request is "fine-tune existing tasks / fix wording / adjust acceptance criteria"

1. Read `references/change.md`
2. Confirm only existing tasks are modified, no new tasks added
3. If new tasks are needed or scope exceeds PRD, route to `genesis`

### Route 4: Request is "new project / major refactor / new version / architecture upgrade"

1. Read `references/genesis.md`
2. Enter versioned architecture workflow

### Route 5: Request is "research first / probe risk first"

- Legacy project or before major change -> `references/probe.md`
- Technical research or solution exploration -> `references/explore.md`

## Boundary Rules

1. You are the navigation layer, not a substitute for all workflows
2. Route to only one primary workflow at a time; if chaining is needed, explain the sequence
3. Before reading target workflow references, do not pretend the process is already followed
4. If the user request spans both design and implementation, converge boundaries first, then choose `/change` or `/genesis`
5. In skills-only mode, workflow details are all under `references/`

## Output Format

When routing decision is complete, output should include:

- Current stage judgment
- Recommended references to read
- Recommended workflow to enter
- Why other workflows are not chosen
- Whether user confirmation is needed
