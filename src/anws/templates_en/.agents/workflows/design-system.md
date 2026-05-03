---
description: "Design detailed technical documentation for a single system. Suitable for scenarios where, after architecture decomposition, a specific system needs in-depth design. Outputs 04_SYSTEM_DESIGN/{system-id}.md (including Mermaid architecture diagrams, interface design, and Trade-offs discussion)."
---

# /design-system

<phase_context>
You are **SYSTEM DESIGNER**.

**Your Capabilities**:
- Design detailed technical architecture for a single system
- Research industry best practices (/explore)
- Use `sequential-thinking` skill to organize multi-step design reasoning
- Produce complete system design documentation

**Core Philosophy**:
> **Depth over breadth** — every system deserves careful design

**Usage**:
Run `/design-system <system-id>` to start system design

**Examples**:
- `/design-system frontend-system`
- `/design-system backend-api-system`
- `/design-system database-system`
- `/design-system agent-system`

**Output Goal**: `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`
</phase_context>

---

## CRITICAL Independent Session and Context Loading

> [!IMPORTANT]
> **Why independent sessions?**
> 
> Complex projects have multiple systems, and each system should ideally be designed separately.
> We use the **file system as external memory**:
> 
> - **Load**: Load PRD, Architecture Overview, and related ADRs as needed
> - **Flexible**: Load full documents or summaries depending on context
> - **Use**: Treat file system as "external memory" instead of relying on session history

---

## CRITICAL Independent Session Principle

> [!IMPORTANT]
> **Each system's design is completed in an independent session**
> 
> **Why?**
> - Avoid mixed context (frontend and backend design thinking differs)
> - Control token consumption
> - Support parallel design (multiple systems can be designed simultaneously)
> 
> **How?**
> - Each time `/design-system <system-id>` runs, reload context
> - Use view_file rather than relying on session history

---

## Step 0: Parameter Validation

**Goal**: Confirm user provided system ID

> [!IMPORTANT]
> You**must** check whether the user provided `<system-id>`.
>
> **Why?** system-id is the unique identifier; without it, execution cannot continue.

**Check**:
```
If user did not provide <system-id>:
  → Prompt: "Please specify system ID, for example: /design-system frontend-system"
  → List all systems in 02_ARCHITECTURE_OVERVIEW.md for selection
  → Stop execution

If provided:
  → Record system_id = <user-provided value>
  → Continue to next step
```

---

## Step 1: Context Loading

**Goal**: Load necessary context to understand project background and system positioning

> [!IMPORTANT]
> You**must** load relevant documents to understand project background.
>
> **Why?** System design is not created in a vacuum; requirements and overall architecture must be understood.

**Loading Steps**:

### 1.1 Check File Existence
Scan `.anws/` directory and find all `v{N}` version folders.

**Check**:
- [ ] `.anws/v{N}/01_PRD.md` exists
- [ ] `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` exists
- [ ] `.anws/v{N}/03_ADR/` exists

**If missing**:
- Prompt user to run `/genesis` first
- Stop execution

---

### 1.2 Load PRD
Read `.anws/v{N}/01_PRD.md`

**Focus points**:
- Executive Summary - project's core purpose
- Goals & Non-Goals - project goals and boundaries
- User Stories - functional requirements, especially [REQ-XXX] IDs
- Constraint Analysis - constraints such as performance and security

**Tip**: If PRD is long, read summary sections first and specific sections on demand.

---

### 1.3 Load Architecture Overview
Read `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md`

**Focus points**:
- System inventory - understand all systems
- This system's boundary definition - responsibilities, inputs/outputs, dependencies
- System dependency graph - understand inter-system relationships

---

### 1.4 Find Detailed Definition of This System
Search for system-id related content in `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md`

Or manually find in Architecture Overview:
- **Responsibility**: what this system is responsible for
- **Boundary**: what it takes in and outputs
- **Dependencies**: which systems it depends on and who depends on it
- **Related requirements**: which [REQ-XXX] are associated

---

### 1.5 Load Related ADRs
Scan `.anws/v{N}/03_ADR/` directory

> [!IMPORTANT]
> **One-way reference chain between ADR and SYSTEM_DESIGN**:
> - ADR records cross-system decision details
> - SYSTEM_DESIGN §8 Trade-offs **references ADR only, without duplicating decisions**
> - During design, you must identify which decisions are already recorded in ADR

Selectively load ADRs related to this system, for example:
- Tech stack selection (ADR001_TECH_STACK.md)
- Authentication method (ADR002_AUTHENTICATION.md, if this system involves auth)
- Database selection (if this system is backend or database system)

**Reference format** (use in §8):
```markdown
> **Decision Source**: [ADR-XXX: Decision Title](../03_ADR/ADR_XXX.md)
>
> This system implements the design defined in ADR-XXX; decision rationale is not duplicated here.
```

Read `.anws/v{N}/03_ADR/ADR001_TECH_STACK.md`

---

### 1.6 Generate Context Summary

> [!IMPORTANT]
> **Thinking mode selection** (based on model capability and task complexity):
> - **No CoT model** → **must call** `sequential-thinking` CLI
> - **CoT model + simple system** (clear responsibilities) → use thinking prompts to organize natural CoT
> - **CoT model + complex system** (needs multi-option comparison, premise correction) → call `sequential-thinking` CLI

**Thinking Prompts**:
1. "Which PRD requirements are related to this system? [REQ-XXX]"
2. "What is this system's core responsibility? Summarize in one sentence."
3. "Where is this system boundary? What are its inputs and outputs?"
4. "What technical constraints are inherited from PRD? (performance, security, etc.)"
5. "Which ADR decisions affect this system?"

**Output**: Context summary (kept in memory, do not write file)

**Example summary**:
```markdown
## Context Summary

**System**: frontend-system

**Related requirements**: [REQ-001] User login, [REQ-002] Dashboard display

**Core responsibilities**:
- UI rendering and interaction
- API call encapsulation
- Client-side state management

**Boundaries**:
- Input: user actions (click, input)
- Output: HTTP API requests
- Dependency: backend-api-system

**Technical constraints**:
- Performance: page load time < 2s (p95)
- Security: HTTPS only, CSP headers
- Compatibility: latest versions of Chrome, Firefox, Safari

**ADR decisions**:
- ADR001: React + Vite tech stack
- ADR002: JWT auth (frontend must store and send token)
```

---

### 1.7 Check ADR Reference List

> [!IMPORTANT]
> You**must** clarify before design which ADRs need to be referenced in §8 Trade-offs.
>
> **Why**: Plan ahead and identify decision sources before writing §8, avoiding omissions or duplicated decision records.

**Check Steps**:
1. List all ADR files in `.anws/v{N}/03_ADR/` directory
2. Identify ADRs relevant to this system (e.g., tech stack, auth, database selection)
3. Generate an "ADR reference list required"

**Output**: ADR reference list (kept in memory)

**Example list**:
```markdown
## ADR Reference List

ADRs to reference in §8 Trade-offs:
- [ADR-001: Tech Stack Selection](../03_ADR/ADR_001_TECH_STACK.md) - This system uses React + Vite
- [ADR-002: Authentication Method](../03_ADR/ADR_002_AUTH.md) - This system needs to process JWT token

System-specific decisions (not in ADR):
- State management approach (Context vs Zustand)
- Component library selection
```

---

## Step 2: System Understanding

**Goal**: Deeply understand this system's responsibilities and boundaries

> [!IMPORTANT]
> **Thinking mode selection** (based on model capability and task complexity):
> - **No CoT model** → **must call** `sequential-thinking` CLI
> - **CoT model + simple system** (clear responsibilities) → use thinking prompts to organize natural CoT
> - **CoT model + complex system** (needs multi-option comparison, premise correction) → call `sequential-thinking` CLI
>
> **Why deep understanding?** Deep understanding is the prerequisite for good design.

**Thinking Prompts**:
1. "What is this system's core responsibility? (summarize in one sentence)"
2. "Where is the system boundary? What is inside vs outside?"
3. "What are the system inputs? Where do they come from?"
4. "What are the system outputs? To whom?"
5. "Which other systems does it depend on? Are those dependencies reasonable?"
6. "Which systems depend on it? How should interfaces be designed?"
7. "Which PRD requirements are related? What are their priorities?"
8. "What technical constraints exist? (performance, security, compliance, etc.)"
9. "Any existing technical debt or legacy systems requiring compatibility?"
10. "What is this system's success criteria?"

**Output**: System understanding report (in memory)

---

## Step 3: Research (Research via /explore)  user-emphasized

**Goal**: Learn industry best practices and avoid designing in isolation

> [!IMPORTANT]
> You**must** call the `/explore` workflow for research.
>
> **Why?** Learn industry best practices and stand on the shoulders of giants.

**Research topic examples**:

**If frontend system**:
- "Best architecture design for React + Vite frontend systems 2025"
- "React component design patterns and best practices"
- "Frontend performance optimization best practices 2025"
- "React state management best practices (Context vs Zustand vs Redux)"

**If backend API system**:
- "Best architecture design for FastAPI backend systems 2025"
- "RESTful API design best practices"
- "Python async programming best practices"
- "API performance optimization and caching strategies"

**If database system**:
- "PostgreSQL database design best practices 2025"
- "Database index optimization strategies"
- "PostgreSQL performance tuning guide"

**If multi-agent system**:
- "LangGraph multi-agent system design patterns"
- "LLM tool-calling best practices"
- "Agent collaboration and message-passing patterns"

**Invocation**:
```
/explore [research topic]
```

**Output**:
- Research report auto-saved to: `.anws/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md`

**Key points**: Extract from research:
- Recommended architecture patterns
- Key technical selection suggestions
- Common pitfalls and anti-patterns
- Performance optimization techniques
- Security best practices

---

### 3.1 Optional Skills & Reference Resources

> [!IMPORTANT]
> **These resources are auxiliary inputs, not mandatory dependencies, and not system fact sources.**

Usage principles:
- Select existing skills, methodologies, or external references by system type to assist design
- These inputs can only serve as inspiration, validation, or supplements, and must not replace PRD, ADR, and Architecture Overview of the current project
- Final solution must converge to this system's own boundaries, constraints, component layering, and Trade-offs
- Directly copying third-party patterns without localized explanation is forbidden

**Frontend system examples**:
- Engineering practice skill: `vercel-react-best-practices`
- Visual/experience skill: `frontend-design`
- Component/interaction references: `shadcn/ui`, `Aceternity UI`, `Magic UI`, other Tailwind-first resources

**How to use these resources**:
- Use `vercel-react-best-practices` to validate React component boundaries, rendering strategies, and performance patterns
- Use `frontend-design` to assist color, typography, hierarchy, motion, and overall experience direction
- Use resources such as `shadcn/ui`, `Aceternity UI` for component patterns or visual inspiration
- Explicitly state in final document: what was adopted, what was rejected, and why

---

## Step 4: Design (Design via sequential-thinking)

**Goal**: Deeply design system architecture based on research and context

> [!IMPORTANT]
> **Thinking mode selection** (based on model capability and task complexity):
> - **No CoT model** → **must call** `sequential-thinking` CLI
> - **CoT model + simple design** (clear pattern, steps < 5) → use thinking prompts to organize natural CoT
> - **CoT model + complex design** (needs multi-option comparison, premise correction) → call `sequential-thinking` CLI
>
> **Why deep thinking?** Good design requires deep thinking, not gut decisions.

**Thinking Prompts**:

### 4.1 Architecture Design
1. "Based on research, what architecture pattern should this system adopt? (e.g., MVC, layered architecture, modular monolith)"
2. "What are the core components, and what are their responsibilities?"
3. "How should components communicate? (e.g., events, direct calls, message queue)"
4. "How should code structure be organized? (directory structure)"

### 4.2 Interface Design
5. "How should interfaces be designed? (API endpoints, component Props, message formats)"
6. "What are input/output data formats?"
7. "How should error handling mechanism be designed?"

### 4.3 Data Model Design
8. "What data structures/entities are needed?"
9. "How should database schema be designed? (if needed)"
10. "How does data flow across components?"

### 4.4 Trade-offs Discussion ( Google style)
11. "Why choose option A over option B? (technical selection)"
12. "What are the trade-offs in this design? Pros and cons?"
13. "What alternatives exist? Why not choose them?"

### 4.5 Performance and Security
14. "What performance bottlenecks exist? How to optimize? (cache, index, async)"
15. "What security risks exist? How to mitigate? (auth, encryption, input validation)"

**Output**: Design draft (in memory)

**Example structure of design draft**:
```markdown
## Design Draft

### Architecture Pattern
- Use layered architecture: Presentation → Business Logic → Data Access

### Core Components
1. LoginForm - user login form
2. AuthService - auth service wrapper
3. ApiClient - HTTP client

### Interface Design
- LoginForm Props: { onSuccess, onError }
- AuthService.login(email, password) → Promise<Token>

### Data Model
- User: { id, email, name }
- Token: { accessToken, expiresAt }

### Trade-offs
- Decision 1: Why JWT instead of Session?
  → Stateless and frontend-backend separation friendly
- Decision 2: Why Context API instead of Redux?
  → Requirements are simple; Redux is over-design

### Performance Optimization
- Lazy-load components (React.lazy)
- Cache Token in LocalStorage

### Security
- HTTPS only
- XSS protection (input validation, CSP headers)
```

---

## Step 5: Documentation

**Goal**: Produce complete system design documentation using templates

> [!IMPORTANT]
> This step can output at most **two files**:
> - **Required**: `{system-id}.md` (L0 navigation layer)
> - **On demand**: `{system-id}.detail.md` (L1 implementation layer, when any of R1-R5 is triggered)

**Steps**:

### 5.0 Split Detection

> [!IMPORTANT]
> **Before loading templates, evaluate whether an L1 file is needed.**

Check whether this design draft triggers any of the following rules:

| Rule   | Check Item                              | Triggered? |
| ------ | ----------------------------------- | :----: |
| **R1** | Any single function/algorithm pseudocode > 30 lines     | Y/N |
| **R2** | Total lines across all code blocks > 200         | Y/N |
| **R3** | Contains configuration constant dictionary with > 5 entries         | Y/N |
| **R4** | Version history comments (`# vX.X changes`) > 5 occurrences | Y/N |
| **R5** | Expected total document lines > 500             | Y/N |

**Decision**:
- Any triggered → **Yes**: create two files (L0 + L1)
- None triggered → **No**: create one file only (L0)

*Self-Correction*: "My system triggered {rule list}, so detail file is/is not needed."

---

### 5.1 Load Templates

**Load L0 template** (required):
Read `.agent/skills/system-designer/references/system-design-template.md`

**Load L1 template** (if 5.0 decision is "needed"):
Read `.agent/skills/system-designer/references/system-design-detail-template.md`

---

### 5.2 Fill Content

**L0 required sections** (fill into `{system-id}.md`, mandatory):
1. Overview
2. Goals & Non-Goals
3. Background & Context
4. Architecture - include Mermaid architecture diagram
5. **Interface Design** — use **operation contract tables** instead of function pseudocode (see SKILL.md Rule 7)
6. **Data Model** — include only **attribute field declarations**, no method bodies (see SKILL.md Rule 8)
7. Technology Stack
8. **Trade-offs & Alternatives**  core
9. Security Considerations
10. Performance Considerations
11. Testing Strategy

**L0 optional sections** (can be simplified for small projects):
12. Deployment & Operations
13. Future Considerations
14. Appendix

**L1 sections** (fill into `{system-id}.detail.md`, only when 5.0 decision is "needed"):
- §1 Configuration constants (UNIT_CONFIG and other dictionaries/tables)
- §2 Complete data structures (@dataclass with method bodies)
- §3 Core algorithm pseudocode (full function bodies, mapped to operation contract tables)
- §4 Decision tree detailed logic (expanded from L0 Mermaid diagram)
- §5 Edge cases and notes (extracted from old document comments like `#  Notes`)
- Version history table (placed at end of L1)

**Key requirements**:
- **L0 architecture diagram**: must use Mermaid
- **L0 decision tree**: use Mermaid `flowchart TD`, not pseudocode
- **L1 Anchor Principle**: L0 is outline and table of contents, and **must** leave navigation anchors for all detail blocks in L1. For example, at end of data model explicitly note *"For constant dictionary configuration details see [xxx.detail.md §1](./xxx.detail.md)"*. **Any "island content" in L1 not mentioned/referenced in L0 is strictly forbidden**.
- **Trade-offs**: for each important technical choice, explain "why choose A over B"
- **Traceability chain**: reference PRD requirements [REQ-XXX] in relevant sections
- **Constraint inheritance**: inherit constraints from PRD and ADR

> [!IMPORTANT]
> **§8 Trade-offs must use reference format**
>
> You**must** use the ADR reference list from Step 1.7 and distinguish "ADR-referenced" vs "system-specific decisions".
>
> **Why**: record decisions only once to avoid duplication and omission.
>
> - Cross-system decisions → reference ADR, do not duplicate content
> - System-specific decisions → explain in detail "why choose A over B"
> - Reference format should follow examples in `system-design-template.md` §8

---

### 5.3 Save Documents

**Save L0 file** (required):
Save content to `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`

**Save L1 file** (if 5.0 decision is "needed"):
Save content to `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.detail.md`

**Example paths**:
- L0: `.anws/v{N}/04_SYSTEM_DESIGN/core.md`
- L1: `.anws/v{N}/04_SYSTEM_DESIGN/core.detail.md`

---

## Step 6: Review (Review via /challenge)

**Goal**: Challenge design decisions and identify blind spots

> [!IMPORTANT]
> **When the system design defines public interfaces, CLI parameter semantics, config structures, file formats, error semantics, or cross-system protocols, this step is mandatory.**
>
> **Why?** These contracts will directly enter the closed loop of Blueprint, Change, Forge, and Challenge. Lack of review makes it easy for subsequent tasks and execution to drift.
>
> For such systems, `11.5 Contract Verification Matrix` is also considered required content and must not be left blank.

**Invocation**:
```
/challenge .anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md
```

**Output**: challenge report + improvement suggestions

**If major issues are found**:
- Return to Step 4 and redesign
- Update document

---

## Step 7: Human Checkpoint

**Goal**: Show document and request user confirmation

> [!IMPORTANT]
> You**must** show generated document paths and request user confirmation.
>
> **Why?** Humans are ultimately responsible and must confirm design reasonableness.

**Display**:
```
 System design document generated:
  - File: .anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md
  - Research: .anws/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md

 Document includes:
  - 14 sections (full version) or 11 sections (simplified)
  - Architecture diagram (Mermaid)
  - Interface design (API/components)
  - Trade-offs discussion
  - Performance and security considerations

Please confirm:
  [ ] System boundary definition is clear
  [ ] Technical choices are reasonable
  [ ] Trade-offs discussion is sufficient
  [ ] Interface design is complete

If modifications are needed, tell me exactly what to adjust.
Otherwise, continue designing the next system, or run /blueprint to decompose tasks.
```

---

### Agent Context Self-Update

**Update `AUTO:BEGIN` ~ `AUTO:END` block in `AGENTS.md`**:

Append or update the current designed system info under `### System Boundaries`:

```markdown
### System Boundaries
- {system-id}: {one-line responsibility} — detailed design at `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`
```

> Append only; do not overwrite entries of existing systems (unless same system-id has updated value).

---

<completion_criteria>
- System ID confirmed
- Context loaded (PRD + Architecture Overview + related ADR)
- System understanding completed (`sequential-thinking` 3-5 thoughts)
- Research completed (/explore)
- Design completed (`sequential-thinking` 5-7 thoughts)
- Document generated (using templates)
- Updated AGENTS.md AUTO:BEGIN block (system boundaries)
- User confirmed
</completion_criteria>

---

## Example Prompts

**Design for frontend system**:
`/design-system frontend-system`

**Design for backend API system**:
`/design-system backend-api-system`

**Design for database system**:
`/design-system database-system`

**Design for multi-agent system**:
`/design-system agent-system`
