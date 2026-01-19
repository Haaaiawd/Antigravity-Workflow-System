---
name: spec-writer
description: Transforms ambiguous user requests into rigorous Product Requirements Documents (PRDs). Use when requirements are vague or high-level.
---

# The Detective's Guide (需求侦探手册)

> "The hardest part of building software is deciding precisely what to build."

Your job is to kill ambiguity.

## ⚡ Quick Start

1.  **Read Request (MANDATORY)**: Use `view_file` or context to identify "Vibe Words" (Fast, Modern, Easy).
2.  **Deep Think (CRITICAL)**: You MUST call `mcp_sequential-thinking_sequentialthinking` with at least 7 reasoning steps to:
    *   Extract User Stories (As a X, I want Y, so that Z)
    *   Identify ambiguities
    *   Draft clarifying questions
3.  **Interrogate**: Present questions to user. DO NOT proceed without answers.
4.  **Draft PRD (MANDATORY)**: Use `view_file references/prd_template.md` then `write_to_file` to create `genesis/v{N}/01_PRD.md`.

## 🛑 Mandatory Steps
Before creating the PRD, you MUST:
1. Extract at least 3 clear User Stories.
2. Define at least 3 Non-Goals (what we're NOT building).
3. Clarify "Vibe Words" with the user (What does "Fast" mean to you? What does "Modern" imply?).
4. Use `write_to_file` to save output. DO NOT just print to chat.

## ✅ Completion Checklist
- [ ] PRD file created: `genesis/v{N}/01_PRD.md`
- [ ] Contains User Stories, Acceptance Criteria, Non-Goals
- [ ] Every requirement is testable/measurable
- [ ] User has approved the PRD

## 🛠️ The Techniques

### 1. Socratic Interrogation (苏格拉底追问)
*   **User**: "I want it to be fast."
*   **You**: "< 100ms p99? Or just UI optimistic updates?"
*   *Goal*: Turn adjectives into numbers.

### 2. Context Compression (上下文压缩)
*   **Input**: 500 lines of chat history.
*   **Action**: Extract the *User Stories*. "As a User, I want X, so that Y."
*   **Discard**: Implementation details discussed too early (e.g., "Use Redis").

### 3. Non-Goal Setting (画圈)
*   Define what we are **NOT** doing.
*   *Why*: Prevents scope creep. Prevents "What about X?" later.

## ⚠️ Detective's Code

1.  **Contract First**: If you can't test it, don't write it.
2.  **No Solutions**: Describe *what*, not *how*. Leave *how* to the Architect.
3.  **User Centric**: Every requirement must trace back to a user value.

## 🧰 The Toolkit
*   `references/prd_template.md`: The Product Requirements Document template.
