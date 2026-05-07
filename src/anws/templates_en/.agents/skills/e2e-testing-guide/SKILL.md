---
name: e2e-testing-guide
description: Defines how to write a human-like E2E / manual verification testing guide and the E2E Verification report shape (PRD trace, surfaces, journeys, steps). No live browser protocol here—`/forge` §3.7 owns execution order.
---

# E2E Testing Guide

This skill covers **only**: (1) **how to write** an executable E2E / manual verification **guide**; (2) the **report layout** (including verdict columns). **Whether the browser is driven against that guide** is orchestrated in **`/forge` §3.7**: produce this report first, then use host browser tools with user authorization to fill evidence.

> Write paths the way a human explores: where you enter, what you click, what you should see. Each row should trace to **PRD / acceptance**.

### The testing guide must read like a human walkthrough (required)

Assume the reader is a **first-time human user**, not an automation script. The guide must reconstruct:

1. **Real entry points**: start where users actually land (home, deep link, email link)—**do not** default to Storybook/internal debug UIs unless the task explicitly allows it.
2. **Look, then act**: each step first states **what should be visible** (headings, primary nav, empty-state copy), then what to click—no “mystery clicks” with no UI context.
3. **Walk the full chrome**: top/side nav, user menu, settings, help, breadcrumbs, back—**places humans poke without docs** must appear in **Surface coverage** or a **Journey**, or land in **Coverage gaps** with a reason.
4. **Exercise discoverable capabilities**: on every leaf screen, **primary + obvious secondary actions** (overflow menus, row actions, tabs) must map to at least one **Step**—**do not** ship a single happy-path paragraph only.
5. **Common human combos**: plan filter+sort+paging, refresh, back, open copied URL, keyboard Tab to primary actions as applicable; if skipped, explain in **Coverage gaps**.
6. **Data shapes**: for lists/tables, write expectations for **empty / one row / many rows** (how to seed data if possible; else **Blockers**).

---

## When to use

- `05A_TASKS.md` lists **E2E** or **manual** validation, or `05B_VERIFICATION_PLAN.md` requires real-machine/UI evidence, or the change touches UI/navigation/forms/auth flows that need real UI proof.
- The user asks for a testing guide, E2E report, or browser checklist.

---

## Hard constraints

- **Traceability**: tables and steps must map to **PRD anchors** or **task acceptance lines**; if no PRD, say so in **Scope** (proxy PRD).
- **Human surface coverage (in the guide)**: follow **“The testing guide must read like a human walkthrough”** above; nav, empty states, secondary entry points, primary/secondary CTAs, tabs, row actions in scope must appear in **Surface coverage** or **Journey/Step**; deliberate omissions go to **Coverage gaps**.
- **No fake execution**: before a live run, leave verdict/evidence cells empty or “pending live run”—**never** `PASS` without execution.
- **Evidence columns for live runs**: URLs/screenshots/logs are filled during `/forge` browser execution; the guide states **what** to capture.
- **Side effects**: mark steps that need prior user approval (login, writes, payments, etc.).

---

## Authoring workflow (documentation only)

### 1. Load context

Task + `05A_TASKS.md`, `05B_VERIFICATION_PLAN.md`, `01_PRD.md` (or PRD paths from **`Input`**), routes/pages notes, run instructions, accounts/roles. Missing URL/account → **Blockers**.

### 2. PRD traceability matrix (RTM)

| PRD ref | Summary | Priority P0/P1/P2 | Journey IDs |
| --- | --- | --- | --- |

If no PRD, use **Task acceptance Tx** in the first column and note it in **Scope**.

### 3. Surface inventory

Enumerate **what a human sees first, then where they click**—**do not** list bare route names without “how a user discovers this”.

| Surface / entry | How a user finds it | Journey mapping | PRD ref |
| --- | --- | --- | --- |

### 4. Journeys and steps

Per journey: PRD, role, entry, goal. **Step order = real human operation order**. Each step must include: **(1) read-screen expectation (2) action (3) observable outcome + what evidence to capture** (e.g. full-page screenshot, specific network success).

Cover: happy path, cold/empty start, representative errors, light edges (refresh/back/deep link), at least one viewport (or state desktop-only explicitly).

### 5. Short execution plan (optional)

`Target` / `Environment` / `Role` / `Data setup` / `Side effects` / `Blockers` in a short list. **Do not** write a long browser automation protocol—live execution is **`/forge` §3.7**.

---

## Required output

Use this Markdown **as the report skeleton**; keep section titles stable. Write as if the executor is a **first-time human**; Surface / Journey / Step must reflect the **human walkthrough** rules above.

<!-- Verdict values (only these three) for "Journey verdict" and "Step verdict" columns:
  PASS — live outcome matches expectation and evidence is filled.
  PARTIAL_PASS — core path usable with a concrete minor gap; Notes says what is missing for PASS.
  FAIL — mismatch or blocker; include Expected / Actual / Repro / Evidence.
  Before any live run, leave verdict cells empty or "pending live run"—never PASS. -->

```markdown
## E2E Verification

### Scope
- PRD / requirement source:
- Target:
- Environment:
- Browser / Viewport (planned):
- User Role:
- Build / Commit:

### PRD traceability (RTM)
| PRD ref | Summary | Priority | Journeys |
| --- | --- | --- | --- |

### Surface coverage
| Surface / entry | How discovered | Journey | PRD ref | Notes |
| --- | --- | --- | --- | --- |

### Journeys
| ID | PRD ref | User Journey | Journey verdict | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |

### Step breakdown
| Journey | Step | PRD ref | Step verdict | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |

### Findings
- [HIGH/MEDIUM/LOW] title
  - PRD ref:
  - Expected / Actual / Repro / Evidence / Suggested fix:

### Coverage gaps
- What is not in journeys or not planned for live run, and why

### Recommendation
- Ship / fix-first guidance (based on guide + any live results; say explicitly if live run not done yet)
```

---

## Snippet templates (paste into journeys)

- **Auth**: guest hits protected route; success/failure/empty field/session expiry messaging.
- **Forms**: required validation; success feedback; failures should not discard input.
- **Lists**: empty/loading/populated; filter/sort/paging; no-results recovery.
- **Navigation**: primary nav, back behavior, deep links, critical actions not obscured.

---

## Quality bar

A reviewer can execute the guide **without reading source** and exercise in-scope surfaces **like a human would**; every row traces to PRD/acceptance. **Surface table and journey steps must not diverge.**
