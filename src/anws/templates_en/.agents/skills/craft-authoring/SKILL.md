---
## name: craft-authoring
description: Required when running /craft. Provides Workflow / Skill / Prompt scaffolds and quality guardrails using judgment-driven criteria.
---

# Craft Authoring - Scaffolds and Self-Check

This skill carries the execution detail of `/craft`.  
`/craft` defines direction; this file defines landing. Direction without landing becomes rhetoric. Landing without direction becomes mechanical output.

## Global Authoring Protocol

1. Keep language precise and intentional.
2. Let narration add force, not noise.
3. Prefer judgment signals over decorative phrasing.
4. Ensure every major section answers: what / why / how to validate.
5. Build meaning first, then rules, then verification.

**Judgment bar**:
- A good document makes execution clearer, steadier, and reproducible.
- A weak document sounds energetic but depends on improvisation.

---

## Workflow Skeleton (minimal)

```markdown
---
description: [one-line purpose]
---

# /name

<phase_context>
You are **[role]**.
**Mission**: …
**Capabilities**: …
**Constraints**: …
**Relationship to user**: …
**Output Goal**: `path`
</phase_context>

---

## CRITICAL Writing Constraints

> [!IMPORTANT]
> Writing constraints are defined in `/craft` and should not be duplicated here.

---

## Step 1: [Title]

### What
...

### Why
...

### How to Validate
- ...
- ...

---

<completion_criteria>
- [observable done condition]
</completion_criteria>
```

## Skill Skeleton (`description` is the trigger)

```markdown
---
name: kebab-name
description: When [concrete trigger scenario], load this skill. [Capability summary]
---

# Title

## What
...

## Why
...

## How to Validate
- Input contract: ...
- Output contract: ...
```

**Bad description**: capability slogan.  
**Good description**: precise trigger boundary.

**Judgment bar**:  
A strong description behaves like a gate, not a banner.  
It defines both when to activate and when not to activate.

## Prompt Skeleton

```markdown
# Title

## What
...

## Why
...

## How to Validate
- Constraints: ...
- Output format: ...
```

## Guardrail Cheat Sheet

| Mechanism | Use |
| --- | --- |
| `[!IMPORTANT]` | non-skippable node |
| `## CRITICAL` | loud boundary |
| `you **must**` | hard action |
| `<completion_criteria>` | definition of done |

Strong constraints explain at least: what, why, and drift signal.

## Filling Pass (equivalent to old Step 5)

Use `sequential-thinking` for 3-5 thoughts to cover goals, risks, I/O, and where research lands.

Quick checks:
- Is each section actionable?
- Is each critical rule justified?
- Is completion externally verifiable?

**Judgment bar**:  
If a paragraph cannot tell the executor what to do, it is noise.  
If it cannot tell why, it is command theater.  
If it cannot tell how to verify, it is wishful writing.

## Validation (before ship)

Structure:
- frontmatter
- `phase_context` (workflow use)
- CRITICAL block
- `<completion_criteria>`

Content:
- correct path and naming
- clear trigger boundaries
- complete input/output contracts
- externally observable failure signals

## Scoring Gate (before release)

Before shipping, run static scoring:

- read `references/PROMPT_QUALITY_RUBRIC.md`
- produce a scorecard using `references/SCORECARD_TEMPLATE.md`
- report Tier (T0/T1/T2/T3) and weighted seven-dimension score

Hard rules:

- if Hard Fail Gate is triggered, final verdict must be `Infeasible`
- if no Hard Fail and weighted score < 4.0, run one repair iteration and re-score

## Self-Critique (last gate)

Use `sequential-thinking` for 3-5 thoughts:
- where users might stall
- where the model might skip
- which section still mixes too many concerns
- what to revise before shipping

Final question:  
If this document is executed repeatedly, are you willing to own its consequences?