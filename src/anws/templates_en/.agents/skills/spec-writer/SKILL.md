---
name: spec-writer
description: Convert vague or high-level requirements into a rigorous Product Requirements Document (PRD). Suitable for scenarios where requirements are unclear, scope is too broad, or expression remains at the conceptual level.
---

# Requirements Detective Manual

> "The hardest part of software development is not how to build it, but precisely defining what should be built."

Your task is to **eliminate ambiguity**.

## Quick Start

1. **Read requirements (mandatory)**: Read user requests and context; identify "feeling words" (e.g., "fast", "modern", "simple").
2. **Deep thinking (critical)**: You **must** do 3-7 rounds of structured reasoning (depending on complexity):
   * Extract User Stories (As a X, I want Y, so that Z)
   * Identify ambiguity points
   * Draft clarification questions
3. **Follow-up clarification**: Ask users clarifying questions. **Do not continue without answers**.
4. **Draft PRD (mandatory)**: Read `references/prd_template.md`, then create `.anws/v{N}/01_PRD.md`.
5. **Ambiguity scan (mandatory)**: After drafting, run the "10-Dimension Ambiguity Scan" below. Fix issues in place or mark them as `[ASSUMPTION]`.
6. **User Story quality gate (mandatory)**: Verify every User Story passes the checklist below.

## Mandatory Steps
Before creating PRD, you **must**:
1. Extract at least 3 clear User Stories.
2. Define at least 3 Non-Goals (explicitly what is **not** in scope).
3. Clarify user "feeling words" (e.g., what exactly does "fast" mean? what does "modern" mean?).
4. Create output files; **do not only print content in chat**.

After creating PRD, you **must**:
5. Execute the "10-Dimension Ambiguity Scan"; fix or tag all `Partial` / `Missing` items.
6. Verify each User Story includes: priority / independently testable / involved systems / edge cases.
7. Ensure `[NEEDS CLARIFICATION]` tag count <= 3 (hard limit). If exceeded, use reasonable defaults with `[ASSUMPTION]`.

## Completion Checklist
- [ ] PRD file created: `.anws/v{N}/01_PRD.md`
- [ ] Includes User Stories, acceptance criteria, Non-Goals
- [ ] Every requirement is testable and measurable
- [ ] User has confirmed PRD

## Methods and Tools

### 1. Socratic follow-up
* **User**: "I want it to be fast."
* **You**: "Do you mean p99 under 100ms, or only optimistic UI updates?"
* *Goal*: Convert adjectives into numbers and verifiable criteria.

### 2. Context compression
* **Input**: 500 lines of chat logs.
* **Action**: Extract *User Stories*: "As a User, I want X, so that Y."
* **Discard**: Premature implementation details (e.g., "use Redis").

### 3. Non-Goal definition (draw the circle)
* Explicitly define what we **will not do**.
* *Why*: Prevent scope creep and endless "what about X?" follow-ups.

## Detective Rules

1. **Contract first**: If it cannot be verified, do not write it into PRD.
2. **Do not steal design work**: Describe *what to do*, not prematurely *how to do it*. Implementation belongs to architecture design stage.
3. **User value first**: Every requirement must trace back to explicit user value.

## Toolbox
* `references/prd_template.md`: PRD template.

## 10-Dimension Ambiguity Scan

After drafting PRD, you **must** systematically scan the full document across these 10 dimensions. This replaces ad-hoc "anything else?" with a **repeatable, exhaustive** method.

For each dimension, mark status: `Clear`  / `Partial`  / `Missing` 

| # | Dimension | What to check | Status |
|---|------|----------|:------:|
| 1 | **Functional scope and behavior** | Core goals / success criteria / explicit exclusions / user role distinctions | |
| 2 | **Domain and data model** | Entities, attributes, relationships / uniqueness rules / lifecycle and state transitions / data-scale assumptions | |
| 3 | **Interaction and UX flow** | Key user paths / error, empty, loading states / accessibility and i18n | |
| 4 | **Non-functional quality** | Performance / scalability / reliability / observability / security and privacy / compliance | |
| 5 | **Integration and external dependencies** | External service failure modes / import-export formats / protocol version assumptions | |
| 6 | **Edge cases and failure scenarios** | Negative scenarios / rate limits / concurrency conflict handling | |
| 7 | **Constraints and trade-offs** | Technical constraints / explicit trade-off records / rejected alternatives | |
| 8 | **Terminology consistency** | Standard glossary / synonym consistency across document | |
| 9 | **Completion signals** | Are acceptance criteria testable? Is DoD measurable? | |
| 10 | **Placeholders and fuzzy words** | TODO markers / unquantified adjectives (fast, scalable, secure, intuitive, robust) | |

**Rules**:
- For `Partial` or `Missing`, rank by **impact x uncertainty**, pick top **5** to ask users
- **Ask one question at a time**; provide recommended answers; user may accept or customize
- After user response, **atomically write** into corresponding PRD section; no contradictory text allowed
- `[NEEDS CLARIFICATION]` hard limit **<= 3**; if still exceeded, use reasonable defaults with `[ASSUMPTION: ...]`
- **Do not ask users** about these reasonable defaults: industry-standard data retention policies, standard web/mobile performance expectations, user-friendly fallback error messages, standard Session or OAuth2 auth

## User Story Quality Gate

Each User Story in PRD **must** pass the following before PRD is considered complete:

| Check Item | Requirement |
|-------|------|
| **Unique ID** | Must include `[REQ-XXX]` for traceability |
| **Priority** | Mark as P0 / P1 / P2, and P0 must be first |
| **Independently testable** | Explain how the story can be demonstrated and validated **independently** |
| **Involved systems** | List concrete system IDs (must align with `02_ARCHITECTURE_OVERVIEW.md`) |
| **Acceptance criteria** | At least 1 Given-When-Then + at least 1 error scenario |
| **Edge cases** | At least 1 edge condition identified |
| **No fuzzy feeling words** | No unquantified adjectives (e.g., fast -> <100ms p99, scalable -> supports N users) |
| **User value** | One sentence stating value to end users |

If any User Story fails, **fix it before delivering PRD**.
