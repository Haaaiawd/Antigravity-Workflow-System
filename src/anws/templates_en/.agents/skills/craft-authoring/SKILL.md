---

## name: craft-authoring
description: Required when running /craft: Workflow / Skill / Prompt scaffolds, guardrail syntax, fill + validation checklists; long templates are not duplicated in the craft workflow—follow this skill.

# Craft Authoring — scaffolds & self-check

This skill holds the **“how to write”** detail for `**/craft`**; the workflow only routes the ritual. **Do not** paste this file back into the workflow.

## Workflow skeleton (minimal)

```markdown
---
description: [one line for listings]
---

# /name

<phase_context>
You are **[role]**.
**Mission**: …
**Capabilities**: …
**Constraints**: …
**Principles**: …
**Relationship to user**: …
**Output Goal**: `path`
</phase_context>

---

## CRITICAL …

> [!IMPORTANT]
> **Why**: …
> - …
> - …

---

## Step 1: …

**Goal**: …

> [!IMPORTANT]
> You **must** … **Why?** …

**Thinking prompts**:
1. …

---

<completion_criteria>
- …
</completion_criteria>
```

## Skill skeleton (`description` = trigger)

```markdown
---
name: kebab-name
description: When [concrete trigger scenario], load this skill. [One-line capability]
---

# Title

## Hard boundaries / principles
…

## Input / output contract
…
```

**Bad** description: “I can handle PDFs.” **Good**: “When the user needs to read/edit PDFs.”

## Prompt skeleton

```markdown
# Title

## Role
…

## Task
…

## Constraints
…

## Output format
…
```

## Guardrail cheat sheet


| Mechanism               | Use                       |
| ----------------------- | ------------------------- |
| `[!IMPORTANT]`          | Non-skippable nodes       |
| `## CRITICAL`           | Loud boundaries           |
| `you **must**`          | Hard actions              |
| Concrete questions      | Instead of “think harder” |
| `<completion_criteria>` | Definition of done        |


Strong constraints answer: **what / why / what violation looks like**.

## Filling content (equivalent to old Step 5)

Use `sequential-thinking` with **3–5 thoughts**: goal, failure modes, I/O per step, prompts, reuse, how research lands in the doc.

Quick scan: goals per step, “why” on constraints, output templates, / contrasts where useful.

## Validation (before ship)

**Structure**: frontmatter, `phase_context` (workflow), CRITICAL blocks, each step has a goal, `<completion_criteria>`.

**Content**: paths with `.anws/v{N}/` when relevant, kebab-case, correct tool syntax.

## Self-critique (last gate)

`sequential-thinking` **3–5 thoughts**: where would users stall? where would the model skip steps? vs `/challenge`-level bar—fix, then ship.