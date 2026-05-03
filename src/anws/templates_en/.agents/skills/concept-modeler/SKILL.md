---
name: concept-modeler
description: Use when user requirements are fuzzy and terminology is unclear. Clarify domain concepts through interactive follow-up questions, extracting entities, flows, and dark matter. Invoked by /genesis Step 1.
---

# Domain Modeler

> "If you can't describe it clearly, you can't build it." -- Eric Evans

This skill turns user "feeling words" into a clear domain model through **interactive follow-up questions**.

---

## Mission and Positioning

**What this skill is**: Interact with users to clarify fuzzy requirements and establish a domain model (entities, flows, dark matter).

**When to invoke**:
- `/genesis` Step 1: requirement clarification phase
- User requirements contain fuzzy terms ("sync", "list", "manage")
- Need to establish a Ubiquitous Language

**When not to invoke**:
- Requirements are already clear and terms are already defined
- Pure technical implementation discussion (no domain modeling needed)

---

## Core Principle

> [!IMPORTANT]
> **Ask only one question at a time; do not output all questions at once.**
>
> **Why?** Users can only think about one question at a time. Step-by-step questioning yields more accurate answers and avoids overwhelming users.

---

## Interactive Process

### Step 1: Scan Ambiguous Areas

**Goal**: Identify fuzzy terms and missing information in requirements.

> [!IMPORTANT]
> You **must** scan user requirements first and identify ambiguity in these categories:
>
> | Category | Check Question |
> | :--- | :--- |
> | **Entity ambiguity** | What is "list"? `Wishlist`? `ShoppingCart`? `TodoList`? |
> | **Verb ambiguity** | Is "sync" one-way or two-way? real-time or batch? failure strategy? |
> | **Dark matter** | User only describes happy path -- error handling? persistence? authentication? |
> | **Boundary ambiguity** | Who can access? data scale? concurrency requirements? |

**Internal output**: Generate a candidate question queue (max 5), sorted by impact. **Do not output the queue**.

---

### Step 2: Interactive Follow-up Loop

**Goal**: Clarify ambiguity one by one, one question per turn.

> [!IMPORTANT]
> **Questioning rules:**
> - Ask at most **5 questions**
> - Each question must be **multiple-choice** or **short answer (<=5 words)**
> - Output only **one question** each turn

#### 2.1 Multiple-choice format

For questions with multiple clear options:

```markdown
**Recommendation:** Option B - Real-time bidirectional sync ensures data consistency for multi-device users.

| Option | Description |
| :--- | :--- |
| A | One-way sync (upload only) |
| B | Real-time bidirectional sync |
| C | Scheduled batch sync |
| Custom | Provide a short description (<=5 words) |

Reply with the option letter (e.g., "B"), say "yes" or "recommend" to accept, or provide a custom answer.
```

#### 2.2 Short-answer format

For questions requiring user-defined input:

```markdown
**Suggestion:** User wishlist - this is the most common term in e-commerce scenarios.

Format: short answer (<=5 words). Say "yes" or "suggestion" to accept, or provide your answer.
```

#### 2.3 Stop conditions

Stop asking when:
- All critical ambiguities are clarified
- User says "done", "okay", or "continue"
- 5 questions have been asked

---

### Step 3: Incremental Model Update

**Goal**: Immediately update the domain model after each answer.

> [!IMPORTANT]
> **Update immediately after each accepted answer**; do not wait until all questions finish.

**Update rules**:
1. Entity clarification -> update `entities` list
2. Verb clarification -> update `flows` list
3. Dark matter identified -> update `missing_components` list
4. Terminology unified -> record in `glossary`

---

## Output Format

**Output path**: `.anws/v{N}/concept_model.json`

```json
{
  "glossary": {
    "Wishlist": "A user's wish list; can add products but does not checkout directly",
    "Sync": "Real-time bidirectional synchronization to keep multi-device data consistent"
  },
  "entities": [
    { "name": "Wishlist", "type": "Aggregate Root", "necessity": "Required", "description": "User's wish list" },
    { "name": "WishlistItem", "type": "Entity", "necessity": "Required", "description": "Product item in the wishlist" }
  ],
  "flows": [
    { "from": "User", "action": "Add", "to": "Wishlist", "data": "Product ID", "trigger": "User click" },
    { "from": "Wishlist", "action": "Sync", "to": "RemoteServer", "data": "Full data", "mode": "Real-time bidirectional" }
  ],
  "missing_components": [
    { "component": "Sync conflict resolution", "category": "Error handling", "priority": "High", "reason": "Concurrent edits on multiple devices" },
    { "component": "Offline queue", "category": "Reliability", "priority": "Medium", "reason": "Buffer operations when network is offline" }
  ],
  "clarifications": [
    { "question": "Is synchronization real-time or batch?", "answer": "Real-time bidirectional sync" }
  ]
}
```

---

## Master Rules

1. **Do not assume**: Never assume you understood user terms. Ask and confirm.
2. **One at a time**: Users can only think about one question at a time. Do not output a question list.
3. **Recommendation first**: Provide a recommended option + rationale to ease decisions.
4. **Incremental updates**: Write each answer immediately to avoid context loss.
5. **Terminology consistency**: Once a term is confirmed, use it consistently and avoid synonyms.
6. **Tool-first questioning**: If structured questioning tools (e.g., `ask question`) are available, prefer them over asking users to type long freeform replies.

---

## Completion Criteria

<completion_criteria>
- ✅ Key ambiguous terms clarified (recorded in glossary)
- ✅ Core entities and relations identified
- ✅ Dark-matter components omitted by users identified
- ✅ Domain model saved to `.anws/v{N}/concept_model.json`
- ✅ User confirms terminology understanding is correct
</completion_criteria>

---

## Collaboration

* **Before**: Fuzzy requirement description provided by user
* **After**: `spec-writer` generates PRD based on clarified requirements
* **Synergy**: Your domain model provides clear terminology foundation for subsequent architecture design
