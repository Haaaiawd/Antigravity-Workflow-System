---
name: e2e-testing-guide
description: Align E2E cases to PRD or acceptance criteria with traceability and scoring; produce user journeys and step-level results; when browser automation exists and the user authorizes, execute and mark each item PASS / PARTIAL_PASS / FAIL, etc., with evidence.
---

# E2E Testing Guide

> "Do not test that a component exists; test that a user can finish the job—and **every test case must point to the PRD clause it proves**."

You are the **E2E verification orchestrator**. Your job is: **derive checkable requirements from the PRD / acceptance criteria** → **map them to browser-executable journeys and steps** → **apply one status model + scoring and record evidence**. If there is no PRD, treat the task’s acceptance criteria / validation notes as a **proxy PRD** and state that gap explicitly in **Scope**.

---

## When to use this skill

Use it when any of the following is true:

- `05_TASKS.md` lists **E2E** or **manual** validation.
- The change affects browser UI, navigation, forms, auth/session, payments, submit/publish flows, etc.
- Acceptance depends on real page state, not only unit or API tests.
- The user asks for "real user" testing, "open the site and walk through", "browser verification", or "screenshot proof".

---

## Hard constraints

- **PRD-first alignment**: every test item must trace to a **PRD section / requirement ID / user-story ID** (or an equivalent numbered acceptance line from the task). If impossible, log a **traceability gap** in **Coverage gaps** with a concrete doc follow-up.
- **User journeys first**: organize steps around user goals, not around components or source files.
- **Do not fake execution**: if you did not open the page, act, and observe outcomes, status must be `NOT_RUN`, not "passed".
- **Evidence loop**: every executed step/journey records URL, environment, account/role (if any), and screenshots or reproducible observations. **PARTIAL_PASS** and **INCONCLUSIVE** still require evidence plus "what is missing to reach PASS".
- **Authorize before side effects**: login, external sites, writes, delete/publish/payment—confirm with the user first.
- **Avoid irreversible actions**: delete, pay, send real notifications, prod publish—stop at confirmation unless explicitly authorized.
- **Failures are outcomes**: record expected vs actual, repro steps, and likely cause—do not hand-wave as "needs more testing".

---

## Workflow

### 1. Load context

Read, in order of relevance:

1. The current task (or the matching block in `05_TASKS.md`)—acceptance criteria, validation type, validation notes.
2. **PRD**—commonly `.anws/v{N}/01_PRD.md`, or PRD paths from the task **`输入`** field; prioritize user stories, feature lists, and acceptance sections.
3. Routes, pages, components, APIs, and state touched by the change.
4. Existing tests, seed data, dev server commands, env docs.

If URL, run command, test account, or target role is missing, list blockers and ask the user.

### 2. PRD mapping & traceability matrix (RTM)

Before writing journeys, produce a **requirements → tests** table:

| PRD ref | Requirement summary (one line) | Priority (P0/P1/P2) | Journey IDs | Notes |
| --- | --- | --- | --- | --- |

Rules:

- **PRD ref** must be locatable: `doc §section` / `REQ-xx` / `US-xx` / `AC-x.y`; if the doc has no IDs, use **`§title + first sentence`** as a stable pseudo-ID.
- Every **P0** requirement maps to at least one journey; any uncovered P0 must be **BLOCKED** or **NOT_RUN** in planning with an explicit environment/data fix plan.
- If there is truly no PRD, use **`Task acceptance item Tx`** in the first column and state in **Scope**: **No PRD—matrix below maps to task fields only**.

### 3. Build journeys and **step-level test flows**

Each journey breaks into **independently scorable** steps (this enables PARTIAL_PASS):

```text
Journey J1: <title>  ← ties back to RTM PRD ref / REQ ID
  PRD: PRD §x.x / REQ-yy (required)
  Role: guest / standard user / admin / other
  Entry: URL or landing page
  Goal: what the user is trying to accomplish

  Step S1.1: <action> → Expected: <observable> → Evidence: <screenshot/URL/…>
  Step S1.2: …

  Journey-level expected: visible feedback, URL changes, durable state
  Evidence index: pointers per step
```

Still cover:

- **Happy path**, **first-time / cold start**, **error path**, **edge path**, **responsive**, **basic a11y** (same bar as before).

### 4. Produce an execution plan

Before running anything, output:

```markdown
## E2E Plan

- PRD / requirement source: <path or "task acceptance only">
- Target: <site URL or local address>
- Environment: <dev / staging / prod-like>
- Browser / viewport: <browser + size>
- Roles: <user roles>
- Data setup: <fixtures / seed>
- RTM: <N> requirements mapped to <M> journeys
- Journeys: J1, J2, … (each lists its PRD ref)
- Side effects: <data created / changed / deleted>
- Blockers: <missing info>
```

If browser automation exists and there are no blockers, confirm user authorization before executing. If no browser tool is available, deliver the guide and state `Execution: Not run - no browser automation available`.

### 5. Browser execution protocol

(Same behavior as before.)

1. Open the target URL; record environment and baseline UI.
2. Start from visible UI affordances—do not fake state via internal APIs unless the task explicitly allows it.
3. Click real controls, fill real forms, wait for visible feedback.
4. After any navigation or DOM change that matters, re-snapshot before the next structural action.
5. Watch URL/route, copy/visuals, validation, loading/empty/error states, console, critical network calls.
6. For high-risk actions, stop at confirmation and record why execution stopped and what authorization is needed.

### 6. Status model and scoring (mandatory)

#### 6.1 Per-step status — powers PARTIAL_PASS

Each **Step** gets exactly one status after execution:

| Code | Meaning |
| --- | --- |
| `PASS` | Expected behavior fully met; evidence sufficient. |
| `PARTIAL_PASS` | **Core usability OK** with a concrete minor gap (unclear copy, minor UI defect, non-blocking perf); Notes must say what is needed to reach **PASS**. |
| `FAIL` | Expected not met; include Expected / Actual / Repro / Evidence. |
| `BLOCKED` | Cannot run this step (env, permissions, data, human-only gate). |
| `NOT_RUN` | Not executed—always include a reason. |
| `INCONCLUSIVE` | **"Maybe"**: attempted but evidence is insufficient, outcome ambiguous, or depends on an unverified external fact—**must not** be treated as PASS; say what evidence would resolve it. |

#### 6.2 Per-journey status — rolls up to the main checklist

Aggregate from steps (document the rollup rule briefly in **Notes**):

| Code | Meaning |
| --- | --- |
| `PASS` | All steps `PASS` (or only documented trivial exceptions with no PRD impact). |
| `PARTIAL_PASS` | No `FAIL`, and at least one step is `PARTIAL_PASS` / `INCONCLUSIVE`, or missing only non-P0 coverage. |
| `FAIL` | Any step `FAIL`, or any P0 step `BLOCKED`/`NOT_RUN` without an approved waiver. |
| `BLOCKED` | Journey cannot start or cannot complete mandatory prerequisites. |
| `NOT_RUN` | Entire journey not executed. |
| `INCONCLUSIVE` | Too many inconclusive steps to declare pass/fail for the journey. |

#### 6.3 Scoring (simple, mandatory)

For **each journey**, assign **`JourneyScore` ∈ {0,1,2,3}** aligned with status (auditable):

| Score | Condition |
| --- | --- |
| **3** | Status `PASS` and all P0-related steps are `PASS`. |
| **2** | Status `PARTIAL_PASS`: core PRD path met; gaps are documented and non-fatal. |
| **1** | Status `INCONCLUSIVE` or several important steps only `PARTIAL_PASS` / thin evidence. |
| **0** | Status `FAIL`, or P0 cannot be verified without waiver. |

For **`BLOCKED`** / **`NOT_RUN`**, use score **`—`** (not applicable)—never treat as 3.

**Overall health (recommended)**: `Overall = average(scores of executed journeys, omitting —)` and state in **Recommendation**:

- `Overall ≥ 2.5` and no `FAIL` journey → lean toward merge/release (still list residual risk).
- Any `FAIL` or any P0 journey **< 2** → default **fix first, then re-test**.

---

## Required output

```markdown
## E2E Verification

### Scope
- PRD / requirement source:
- Target:
- Environment:
- Browser / Viewport:
- User Role:
- Build / Commit:

### PRD traceability (RTM)
| PRD ref | Summary | Priority | Journeys |
| --- | --- | --- | --- |

### Scoring summary
- Overall score (0–3, avg of executed journeys): <number or "n/a">
- Gate recommendation: <ship / fix-first / blocked>

### Checklist (journey-level)
| ID | PRD ref | User Journey | JourneyScore | Status | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |

### Step breakdown
| Journey | Step | PRD ref | Step status | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |

### Findings
- [HIGH/MEDIUM/LOW] <title>
  - PRD ref:
  - Expected:
  - Actual:
  - Repro:
  - Evidence:
  - Suggested fix:

### Coverage gaps
- <uncovered PRD lines / journeys and why>

### Recommendation
- <merge/release vs fix-first; cite Overall and FAIL/P0>
```

If nothing failed, still write:

```text
No E2E issues found in executed journeys. Remaining risk: <uncovered areas>.
```

---

## Journey templates (reuse)

### Auth / session

- Guest hitting a protected route is guided to sign-in.
- Valid credentials return to the intended page.
- Wrong password / empty fields / expired session show clear errors.
- Refresh preserves or expires session per design.
- After sign-out, back button does not leak protected content.

### Forms / submit

- User can find the form from normal navigation and submit end-to-end.
- Required fields, formats, length limits, duplicate submit are handled.
- Success shows a clear next step.
- On failure, user input is not silently discarded.

### Lists / search / filters

- Empty, loading, and populated states are understandable.
- Search, filter, sort, pagination compose sensibly.
- URL reflects important query state when designed to.
- "No results" offers a recovery path.

### Create / edit / delete

- Created rows appear in list/detail after reload.
- Edits persist across reload.
- Destructive actions require confirmation; stop before commit without authorization.
- Cancel paths leave no unintended side effects.

### Navigation / layout

- Primary entry points are discoverable; back/forward behavior is sane.
- Deep links open directly.
- Key actions are not obscured at desktop and mobile widths.

---

## Quality bar

A good E2E guide reads like a serious tester’s **requirements trace runbook**: **PRD anchor → journey → per-step status → score → evidence → verdict**. A bad one only says "test login, test submit" with no PRD line items—**not acceptable**.
