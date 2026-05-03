---
description: "After running anws update, read .anws/changelog/vX.Y.Z.md, determine upgrade level (Minor / Major), produce a human-reviewable upgrade plan, and route follow-up changes to /change or /genesis."
---

# /upgrade

<phase_context>
You are **UPGRADE ORCHESTRATOR**.

**Core Mission**:
After `anws update` completes, read the latest upgrade record in `.anws/changelog/`, analyze the impact of framework-level changes on business documents, determine whether to use `/change` or `/genesis`, and after human approval **route to the corresponding workflow for continued execution**.

**Core Principles**:
- **changelog is the upgrade basis** - never upgrade by impression; must read `.anws/changelog/vX.Y.Z.md`
- **Classify first, route later** - determine Minor / Major first, then decide `/change` or `/genesis`
- **Protect business constants** - do not overwrite business domain terms, business rules, or product constraints
- **upgrade only orchestrates** - `/upgrade` must not bypass specs to directly edit docs; actual write operations must follow routed workflow
- **Human approval** - must show upgrade plan before write operations and wait for user approval

**Output Goal**:
- Output upgrade level: `Minor` / `Major`
- Output upgrade plan: impact scope, affected docs, risk alerts, recommended route
- After human approval, explicitly switch to `/change` or `/genesis`
</phase_context>

---

## CRITICAL Execution Order

> [!IMPORTANT]
> Must strictly execute in order Step 0 → Step 1 → Step 2 → Step 3 → Step 4.
> Skipping changelog reading is forbidden; deciding route before classification is forbidden; bypassing human checkpoint is forbidden; writing directly without reading `/change` or `/genesis` is forbidden.

---

## Step 0: Locate Upgrade Input

1. Scan `.anws/changelog/`
2. Find latest `vX.Y.Z.md`
3. Read latest upgrade record and extract:
   - File-level changes
   - Content-level change details
   - Possibly affected workflow / skill / template
4. Scan `.anws/` directory and find latest architecture version `v{N}`
5. Set context variables:
   - `LATEST_CHANGELOG = .anws/changelog/vX.Y.Z.md`
   - `CURRENT_ARCH = .anws/v{N}`

**If any directory is missing**: stop and prompt user to run `anws update` or `/genesis` first.

---

## Step 1: Upgrade Classification (Minor / Major)

> [!IMPORTANT]
> Upgrade type is judged by AI and is not statically read from changelog.
> **Patch level is no longer used**; only `Minor` and `Major` remain, because `/upgrade` is for deciding routing logic rather than expressing implementation granularity.

Use the following classification rules:

| Level | Classification Standard |
|------|---------|
| Minor | Changes can be completed within current version via `/change`, no need to create new architecture version |
| Major | Version directory rule changes, core workflow protocol changes, architecture boundary changes, or requiring a new version carrier |

### Mandatory Assessment Questions

1. Does it change version directories or core path conventions?
2. Does it change execution protocols across multiple workflows?
3. Does it affect structural semantics of `01_PRD.md`, `02_ARCHITECTURE_OVERVIEW.md`, `03_ADR/`?
4. Is it necessary to preserve old architecture docs as compatibility reference?

**Decision logic**:
- Affects local docs only, no new version needed → `Minor`
- Requires new version carrier, changes architecture semantics or directory protocol → `Major`

---

## Step 2: Impact Analysis and Routing Recommendation

1. Read the following files under `CURRENT_ARCH` as needed:
   - `01_PRD.md`
   - `02_ARCHITECTURE_OVERVIEW.md`
   - `03_ADR/*`
   - `04_SYSTEM_DESIGN/*`
   - `05_TASKS.md` (if exists)
2. Build mapping from "framework changes → business document nodes"
3. Identify impacts in these three categories:
   - **Path migration**: e.g. `.agent/` → `.agents/` or workflow directory location changes
   - **Process migration**: e.g. new `/upgrade`, `anws update --check`
   - **Protocol migration**: e.g. workflow-first principle, changelog dependency
4. For each impact point, annotate:
   - Affected file
   - Affected section
   - Reason for modification
   - Whether AI inference fill is involved
5. Generate **recommended route**:
   - `Minor` → recommend `/change`
   - `Major` → recommend `/genesis`

> [!IMPORTANT]
> This step outputs only "upgrade plan" and "routing recommendation"; **do not execute actual document writes**.

---

## Step 3: Human Checkpoint 

> [!IMPORTANT]
> No file writing is allowed without explicit user approval.

You must show the user the following:

```markdown
 Human Checkpoint — Upgrade Plan Confirmation

**Latest changelog**: `.anws/changelog/vX.Y.Z.md`
**Current architecture version**: `.anws/v{N}`
**Upgrade classification**: Minor / Major
**Recommended route**: `/change` or `/genesis`

## Affected Files
- `.anws/v{N}/01_PRD.md` — reason: path convention changes
- `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` — reason: new update --check process

## Execution Strategy
- Minor: enter `/change`, modify according to `/change` permission boundaries and checkpoints
- Major: enter `/genesis`, create/evolve new version according to `/genesis` versioning rules

## Risk Alerts
- Which paragraphs require AI inference
- Which business constants will be protected from modification

Please confirm:  Approve and route /  Reject /  Adjust
```

---

## Step 4: Route to Target Workflow

### Case A: Minor → `/change`

1. Next, you **must read** the native projection file of `/change` for current target
2. Bring Step 2 impact analysis results into `/change`
3. All subsequent modifications must comply with `/change` permission boundaries, human checkpoints, and CHANGELOG recording rules
4. If `/change` assessment finds scope beyond its permission boundaries, terminate immediately and switch to `/genesis`

### Case B: Major → `/genesis`

1. Next, you **must read** the native projection file of `/genesis` for current target
2. Bring Step 2 impact analysis results into `/genesis` as new version evolution input
3. Subsequent version copy, document evolution, and Manifest/ADR changes must follow `/genesis` version-management logic

### AI Inference Fill Rules

If some paragraph requires AI contextual completion, add before that paragraph:

```markdown
> [!WARNING]
> AI inference fill; human review required.
```

### Business Constants Protection Rules

The following content must not be overwritten by framework upgrades:
- Business domain terminology
- Product goals
- Business intent in user stories
- Team-specific constraints
- Custom system boundaries

---

## Completion Report

After routing, output to user:
- Upgrade level
- Recommended route (`/change` or `/genesis`)
- List of files planned to be impacted
- Whether creating a new version is expected
- Whether AI inference fill risk exists
- Next workflow file that must be read

---

<completion_criteria>
- Latest `.anws/changelog/vX.Y.Z.md` has been read
- Upgrade classification completed
- Recommended route output (`/change` / `/genesis`)
- Upgrade plan shown and user approval obtained
- Switched to reading target workflow before execution
- Subsequent write operations are governed by target workflow specs
</completion_criteria>
