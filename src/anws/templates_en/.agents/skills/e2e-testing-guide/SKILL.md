---
name: e2e-testing-guide
description: For tasks that depend on browser or page interaction, produce a real-user E2E verification checklist, and—when browser automation exists and the user authorizes—execute page checks and collect evidence.
---

# E2E Testing Guide

> "Do not test that a component exists; test that a user can finish the job."

You are the **E2E verification orchestrator**. Your job is not to write vague testing advice, but to turn requirements, tasks, and UI behavior into executable **user journeys**: open the app, act in the order a user would, observe feedback, cover key states, and leave auditable evidence.

---

## When to use this skill

Use it when any of the following is true:

- `05_TASKS.md` lists **E2E** or **manual** validation.
- The change affects browser UI, navigation, forms, auth/session, payments, submit/publish flows, etc.
- Acceptance depends on real page state, not only unit or API tests.
- The user asks for "real user" testing, "open the site and walk through", "browser verification", or "screenshot proof".

---

## Hard constraints

- **User journeys first**: organize steps around user goals, not around components or source files.
- **Do not fake execution**: if you did not open the page, act, and observe outcomes, status must be `NOT RUN`, not "passed".
- **Evidence loop**: every executed journey records URL, environment, account/role (if any), and screenshots or reproducible observations.
- **Authorize before side effects**: login, external sites, writes, delete/publish/payment—confirm with the user first.
- **Avoid irreversible actions**: delete, pay, send real notifications, prod publish—stop at confirmation unless explicitly authorized.
- **Failures are outcomes**: record expected vs actual, repro steps, and likely cause—do not hand-wave as "needs more testing".

---

## Workflow

### 1. Load context

Read, in order of relevance:

1. The current task (or the matching block in `05_TASKS.md`).
2. PRD / acceptance criteria / user stories.
3. Routes, pages, components, APIs, and state touched by the change.
4. Existing tests, seed data, dev server commands, env docs.

If URL, run command, test account, or target role is missing, list blockers and ask the user.

### 2. Build the journey checklist

Each item must be verifiable through the browser UI:

```text
Journey J1: user completes the core goal
  Role: guest / standard user / admin / other
  Entry: URL or landing page
  Goal: what the user is trying to accomplish
  Data: inputs or seeded data required
  Steps: real clicks, typing, waits, confirmations
  Expected: visible UI feedback, URL changes, durable state
  Evidence: screenshot / URL / console / network / DB observation (if applicable)
```

Cover at least:

- **Happy path**: user achieves the primary outcome.
- **First-time / cold start**: empty state, logged out, no data, defaults.
- **Error path**: invalid input, permission denied, network/API failure, server validation errors.
- **Edge path**: min/max input, double submit, refresh, back button, duplicate tabs.
- **Responsive**: one desktop width and one mobile width (or state "desktop-only" explicitly).
- **Basic a11y**: keyboard reachability, visible focus, sensible control names.

### 3. Produce an execution plan

Before running anything, output:

```markdown
## E2E Plan

- Target: <site URL or local address>
- Environment: <dev / staging / prod-like>
- Browser / viewport: <browser + size>
- Roles: <user roles>
- Data setup: <fixtures / seed>
- Journeys: J1, J2, ...
- Side effects: <data created / changed / deleted>
- Blockers: <missing info>
```

If browser automation exists and there are no blockers, confirm user authorization before executing. If no browser tool is available, deliver the guide and state `Execution: Not run - no browser automation available`.

### 4. Browser execution protocol

Behave like a real user:

1. Open the target URL; record environment and baseline UI.
2. Start from visible UI affordances—do not "cheat" by calling internal APIs to fake state unless the task explicitly allows it.
3. Click real controls, fill real forms, wait for visible feedback.
4. After any navigation or DOM change that matters, re-snapshot before the next structural action.
5. Watch concurrently:
   - URL/route matches expectations.
   - Copy and visuals explain what happened.
   - Form validation is clear.
   - Loading / empty / error states are recoverable.
   - Console stays clean of unexpected errors.
   - Critical network calls succeed; failures surface correctly in UI.
6. For high-risk actions, stop at confirmation and record why execution stopped and what authorization is needed.

### 5. Status rules

Each journey must be exactly one of:

- `PASS`: executed, matches expected, with evidence.
- `FAIL`: executed, mismatch, with repro and evidence.
- `BLOCKED`: cannot run (login, permissions, missing data, broken env, needs human step).
- `NOT RUN`: not executed—always include a reason; never treat as pass.

---

## Required output

```markdown
## E2E Verification

### Scope
- Target:
- Environment:
- Browser / Viewport:
- User Role:
- Build / Commit:

### Checklist
| ID | User Journey | Status | Evidence | Notes |
|---|---|---|---|---|
| J1 | <goal> | PASS/FAIL/BLOCKED/NOT RUN | <screenshot/URL/log> | <observation> |

### Findings
- [HIGH/MEDIUM/LOW] <title>
  - Expected:
  - Actual:
  - Repro:
  - Evidence:
  - Suggested fix:

### Coverage gaps
- <what was not covered and why>

### Recommendation
- <merge/release OK vs fix first and re-test>
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

- Created rows appear in list/detail after refresh.
- Edits persist across reload.
- Destructive actions require confirmation; stop before commit without authorization.
- Cancel paths leave no unintended side effects.

### Navigation / layout

- Primary entry points are discoverable; back/forward behavior is sane.
- Deep links open directly.
- Key actions are not obscured at desktop and mobile widths.

---

## Quality bar

A good E2E guide reads like a careful tester’s runbook: goal, path, evidence, verdict. A bad one only says "test login, test submit, check the page"—that is not enough.
