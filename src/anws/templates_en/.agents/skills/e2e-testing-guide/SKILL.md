---
name: e2e-testing-guide
description: Used in `/forge` verification when tasks require E2E, browser smoke, or manual web checks—produce a traceable Testing Guide (steps, data, evidence); with browser tooling and explicit user authorization you may execute real UI checks, otherwise deliver a finalized guide plus a statement of what was not run.
---

# E2E / Browser Testing Guide

You author the **E2E Testing Guide**. You do not replace unit tests; you spell out **how a human proves correctness in the browser** as an executable protocol.

## Hard constraints

- **Never infer tooling from IDE name**: base decisions only on whether this session has browser automation/MCP access and explicit user authorization.
- **Honesty without tools**: if there is **no browser tool** → output **Tier-0 finalized guide** + **not-run statement** (do not invent “clicked/saved screenshot” evidence).
- **Separate from `code-reviewer`**: this skill covers behavioral path verification guidance; **static contract alignment stays with `code-reviewer`.**

## When to activate

- **`/forge`**: task `**Validation Type**` is E2E, or manual validation depends on browser/UI.

## Output shape (required)

1. **Environment**: URL/port, account roles, seed data, feature flags.
2. **Steps**: numbered steps; each expects DOM/network/console signals.
3. **Evidence**: screenshot naming, HAR/log paths; optional recording.
4. **Negative paths**: at least one failure / empty-state / permission-denied path (when in scope).
5. **Scorecard**: against project E2E rubric when referenced by the task, else a minimal MUST checklist.

## Minimal MUST rubric (when project has no template)

- Cold-start reproducible from the doc
- Each step has observable assertions (not “looks fine”)
- Covers Given–When–Then implied by acceptance criteria
- Logs known flakes + retry strategy

## Browser-capable mode

When browser tools are available and the user authorizes execution:

1. Run critical paths against the Guide
2. Attach screenshots or console excerpts to the verification report
3. If blocked (login/CAPTCHA/missing data) → note blockers and fall back to guide-only

## Output template

```markdown
## E2E / Browser verification — T{X.Y.Z}

**Mode**: Executed | Guide-only  
**Environment**: …

### Steps
1. …

### Evidence
- …

### Not run / Blockers (if any)
- …
```
