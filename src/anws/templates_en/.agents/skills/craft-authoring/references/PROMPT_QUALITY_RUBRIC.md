## Prompt Quality Rubric v1.0 (Static)

Purpose: evaluate Workflow / Skill / Prompt quality through static review without runtime sampling.

---

## 0. Precondition: Static Ablation

Before scoring, remove external attachments:

- emotional imperative phrases
- format-forcing clauses
- anti-hallucination patch sentences

Keep the core skeleton:

- Role
- Context / Worldview
- Core Concepts
- Reasoning Path

If the skeleton collapses after ablation, prioritize T2 or T3.

---

## 1. Tier Classification

- `T0` Native Resonance: stable style and control loop survive ablation
- `T1` Structural Anchoring: reliability mainly comes from strong structure
- `T2` External Attachment: behavior depends on imperative patches
- `T3` Cognitive Collapse: factual or logical premise is invalid

> Rule: if T3 is hit, mark infeasible regardless of high sub-scores.

---

## 2. Seven-Dimension Matrix (0-5)

Each dimension must include: `score` + `evidence` + `fix` + `confidence`.

### D1 Structure (weight 20%)
- clarity of segmentation and structural control

### D2 Alignment (weight 20%)
- consistency among objective, steps, and validation

### D3 Robustness (weight 15%)
- resilience to adversarial, missing, or contradictory input

### D4 Efficiency (weight 10%)
- token cost versus control benefit

### D5 Meta-Isomorphism (weight 15%)
- whether demanded quality matches textual quality

### D6 Groundability (weight 10%)
- ability to convert abstraction into executable behavior

### D7 Ablation Survivability (weight 10%)
- whether the ablated skeleton still drives behavior

---

## 3. Hard Fail Gate

Trigger hard fail if any is true:

1. feasibility check finds fictional core premises (T3)
2. critical steps have no verifiable completion signal
3. critical dependency path is unresolved and has no blocker exit

Hard fail output: `Infeasible` + evidence + minimum repair actions.

---

## 4. Consistency Protocol

- Prefer two independent reviewers
- Any single-dimension gap > 1.0 goes to arbitration
- Arbitration must cite text evidence, never impression-only judgment

---

## 5. Final Score and Grade

- Weighted final score: 0-5
- `A`: >= 4.5
- `B`: 4.0-4.49
- `C`: 3.0-3.99
- `D`: < 3.0

If hard fail gate is triggered, final verdict is forced to `Infeasible`.
