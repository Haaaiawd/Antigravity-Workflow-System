---
name: tech-evaluator
description: Evaluate tech-stack options and produce Architecture Decision Records (ADR) using weighted decision matrix and ATAM methodology.
---

# The Tech Evaluator's Manual

> "There is no best tech stack, only the most suitable one." -- ThoughtWorks Technology Radar

This skill is based on **SEI ATAM (Architecture Tradeoff Analysis Method)** and a **weighted decision matrix**.

---

## Mandatory Deep Thinking

> [!IMPORTANT]
> Before evaluation, you **must** use `sequential-thinking` skill with **3-7 thoughts** depending on complexity.
> Example prompts:
> 1. "What are the user's core requirements? Which scenarios must be supported?"
> 2. "What technologies is the team currently familiar with? What is the learning-time budget?"
> 3. "What are budget constraints? Are cloud costs sensitive?"
> 4. "What scale is expected for this project? How many concurrent users are needed?"
> 5. "Are there compliance requirements (GDPR, etc.) affecting technology choice?"

---

## Task Goal

Produce an **ADR (Architecture Decision Record)** documenting tech-stack decisions and rationale.

---

## Evaluation Flow

### Step 1: Gather Constraints

**Must obtain from user**:
- **Functional requirements**: list of core functions
- **Non-functional requirements**: performance targets, availability requirements, security level
- **Team context**: team size, skill stack, willingness to learn
- **Budget**: development budget, operations budget, timeline budget
- **Special constraints**: compliance, existing-system integration, customer-mandated technologies

### Step 2: Identify Candidate Stacks

**2025 mainstream stack reference**:

| Scenario | Recommended Stack | Alternatives |
|------|--------|------|
| **Web full stack** | Next.js + TypeScript | Nuxt, SvelteKit |
| **Backend API** | Go / Rust / Node.js | Python FastAPI, Java Spring |
| **Desktop app** | Tauri (Rust + Web) | Electron, Flutter Desktop |
| **Mobile app** | React Native / Flutter | Native Swift/Kotlin |
| **AI/ML** | Python + PyTorch/TensorFlow | Rust (Candle), Julia |
| **Data-intensive** | PostgreSQL + TimescaleDB | ClickHouse, DuckDB |

### Step 3: 12-Dimension Evaluation

Score each candidate (1-5) with this matrix:

| Dimension | Suggested Weight | Evaluation Question |
|------|:--------:|---------|
| **Requirements fit** | — | Can it implement all core features? |
| **Scalability** | — | Can it support 10x growth? |
| **Performance** | — | Can it meet latency/throughput targets? |
| **Security** | — | Built-in security features? Compliance support? |
| **Team skill fit** | — | Team familiarity? Learning curve? |
| **Talent market** | — | Is hiring easy? |
| **Development velocity** | — | Can iteration be fast? |
| **TCO** | — | Dev + ops + license cost? |
| **Ecosystem** | — | Library/tool richness? Problem-solving speed? |
| **Long-term maintenance** | — | Tech lifespan? LTS support? |
| **Integration capability** | — | Integration with existing/third-party systems? |
| **AI readiness** | — | Ease of AI/LLM integration? |

### Step 4: Trade-off Analysis

Use **ATAM**:
1. Identify **quality-attribute scenarios** (e.g., "response <200ms at 1000 concurrent users")
2. Evaluate each candidate's **support level** for scenarios
3. Identify **trade-off points** (e.g., "Go has strong performance but requires team ramp-up")
4. Identify **risk points** (e.g., "new framework may introduce unknown pitfalls")

### Step 5: Generate ADR

You **must** create `ADR_001_TECH_STACK.md` and write it to `.anws/v{N}/03_ADR/`.

---

## ADR Output Template

```markdown
# ADR-001: Tech Stack Selection

## Status
Accepted / Proposed / Deprecated

## Context
[Project background and constraints]

## Decision
[Selected stack and core rationale]

## Candidate Comparison

| Candidate | Total Score | Pros | Cons |
|------|------|------|------|
| Option A | 42/60 | ... | ... |
| Option B | 38/60 | ... | ... |

## Trade-offs
- [Trade-off 1]
- [Trade-off 2]

## Consequences
- Positive: [...]
- Negative: [...]
- Follow-up actions needed: [...]
```

---

## Master Rules

1. **Prefer "boring" tech**: choose mature, stable tech unless there is strong reason not to.
2. **Limited innovation budget**: each project gets only 1-2 innovation points; use boring tech for the rest.
3. **Team capability first**: great tech is useless if the team cannot use it.
4. **TCO is not only money**: time and cognitive costs are also costs.

---

## Toolbox

* `references/ADR_TEMPLATE.md`: ADR template
* `references/TECH_RADAR_2025.md`: 2025 technology radar reference
