<div align="center">

<img src="assets/logo.png" width="200" alt="Antigravity Workflow System">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Target: Antigravity](https://img.shields.io/badge/Environment-Antigravity-blueviolet)](https://github.com/google-deepmind/antigravity)
[![Vibe Coding](https://img.shields.io/badge/Vibe%20Coding-Enabled-ff69b4)](https://github.com/karpathy/vibe-coding)

[English](./README.md) | [中文](./README_CN.md)

</div>

---

## ⚡ What is this?

A **structured workflow framework** for Agentic AI assistants, designed to solve the core pain points of the Vibe Coding era.

> 💡 **TL;DR**: Stop letting AI write spaghetti code. Force it to think like an architect first.

### 🎯 Problems We Solve

| Pain Point | The Problem | Our Solution |
|------------|-------------|--------------|
| **Architecture Drift** | AI generates inconsistent patterns across the same codebase | `/genesis` forces PRD & architecture design first |
| **Spaghetti Code** | AI lacks project context, writes code that doesn't fit | Tasks include constraints & acceptance criteria |
| **Context Amnesia** | New session = AI forgets all previous decisions | `.agent/rules/agents.md` + versioned docs as persistent memory |
| **Lack of Planning** | Vibe Coding skips design, creates tech debt | Mandatory design-first workflow |

---

## 🚀 Quick Start

### Option A — npm CLI (Recommended)

```bash
npm install -g @haaaiawd/anws
cd your-project
anws init
```

> Requires Node.js ≥ 18.

### Option B — GitHub Release

Download the latest `.zip` from [Releases](https://github.com/Haaaiawd/Antigravity-Workflow-System/releases), then copy `.agent/` to your project root.

### Option C — Clone

```bash
# Clone this repository
git clone https://github.com/Haaaiawd/Antigravity-Workflow-System.git

# Copy .agent/ to your project root
# Unix/Mac:
cp -r Antigravity-Workflow-System/.agent ./
# Windows PowerShell:
Copy-Item -Recurse Antigravity-Workflow-System/.agent -Destination .
```

### Your First Project 🐣

> **Example Prompt**: "I want to build a web-based macOS simulator, including Dock, top bar, and several system apps. Please start this new project from scratch according to the development process."

**Deep Thinking & Architecture Design**: The AI will automatically execute the `/genesis` workflow, thinking deeply about project requirements and producing the PRD and architecture design.
<img src="assets/genesis工作流演示.jpg" width="800" alt="Genesis Workflow">

**Interactive Requirement Alignment**: The AI will ask follow-up questions for ambiguous requirements to ensure the design matches your intuition.
<img src="assets/与人类交互确认细节.jpg" width="800" alt="Human Interaction">

**Autonomous Task Breakdown & Execution**: The AI will autonomously call necessary Skills (e.g., `spec-writer`, `task-planner`, etc.) to complete documentation and task decomposition.
<img src="assets/自主调用skills.jpg" width="800" alt="Skills Execution">

---

## 🗺️ Decision Flowchart

```
                    ┌─────────────────┐
                    │  Where are you? │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   New    │      │  Legacy  │      │ Existing │
    │ Project  │      │ Takeover │      │  Change  │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                 │
         ▼                 ▼                 ▼
    /genesis          /scout        Tweak existing task?
         │                 │              /         \
         │                 │             /           \
         └────────┬────────┘     /change       /genesis
                  │            (modify only)  (new tasks)
                  ▼                │            │
           /design-system <--------+-----------+
          (optional, recommended)
                  |
                  v
            /challenge
          (audit & review)
                  |
                  v
             /blueprint
                  |
                  v
               /forge
          (code delivery)
```

---

## 🔑 Core Principles

### 1. Versioned Architecture
> Don't "fix" architecture docs. **Evolve** them.

- `genesis/v1` → `genesis/v2` on major changes
- Full traceability of decisions
- No "it was always like this" mystery

### 2. Deep Thinking First
> AI must think before it writes.

- Workflows force multi-step reasoning via `sequentialthinking`
- `[!IMPORTANT]` blocks as guardrails
- No shallow, scan-and-output responses

### 3. Filesystem as Memory
> Chat is ephemeral. Files are eternal.

- `AGENTS.md` = AI's anchor
- Architecture docs = persistent decisions
- New session recovery in 30 seconds

---

## 📋 Workflows

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `/genesis` | Start from zero, create PRD & architecture | Vague idea | PRD, Architecture, ADRs |
| `/scout` | Analyze legacy codebase risks | Existing code | Risk report, Gap analysis |
| `/design-system` | Detailed design for a system | Architecture | System Design doc |
| `/challenge` | Systemic 3-tier review & audit | Full Design Docs | Challenge Report (Graded) |
| `/blueprint` | Break architecture into tasks | PRD + Arch | TASKS.md (WBS) |
| `/forge` | Execute tasks — architecture to code | TASKS.md | Working code, verified |
| `/change` | Tweak existing tasks (no new tasks) | Minor tweak | Updated TASKS + Design files (modify only) |
| `/explore` | Deep research & brainstorm | Topic/Question | Exploration report |
| `/craft` | Create workflows/skills/prompts | Creation request | Workflow / Skill / Prompt docs |

---

## 🛠️ Compatibility & Prerequisites

> ⚠️ **Important**: This framework requires **Antigravity** environment with `.agent/workflows/` support.

| Environment | Status | Notes |
|-------------|:------:|-------|
| **Antigravity** | ✅ Supported | Full workflow + skills support |
| Claude Code | ❌ No native workflow support | |
| Cursor | ❌ No workflow support | |
| GitHub Copilot | ❌ No workflow support | |

**What is Antigravity?**

Antigravity is an Agentic AI coding environment that natively recognizes `.agent/workflows/` directory and can execute slash commands like `/genesis`, `/blueprint`, etc.

### 🔌 Required: Sequential Thinking MCP Server

This framework uses `sequentialthinking` for deep reasoning. Install it via MCP Store:

1. Open **Antigravity Editor**
2. Click **"..."** (three dots) in the sidebar → **Additional Options**
3. Select **MCP Servers**
4. Open **MCP Store** and search for `sequential-thinking`
5. Click **Add** to install

> 💡 Without this, workflows still work, but deep thinking features will be limited.

---

## ⚡ Invoke Workflows

Antigravity will automatically recognize the intent and trigger the appropriate workflow. You can use it in two ways:

#### ⚡ Method A: Slash Protocol (Explicit)
Directly type the command in the chat or editor to trigger the workflow.
- `/genesis` - Start project creation
- `/scout` - Analyze existing codebase
- `/blueprint` - Break down architecture into tasks

#### 🧠 Method B: Intent Protocol (Implicit)
Just speak naturally. Antigravity will automatically select and run the right workflow.
- *"I want to start a new project for a todo app"* → Triggers `/genesis`
- *"Help me understand this legacy code and its risks"* → Triggers `/scout`
- *"I think there are gaps in this design, challenge it"* → Triggers `/challenge`
- *"The architecture is ready, let's plan the tasks"* → Triggers `/blueprint`
- *"Change the error message on the login page"* → Triggers `/change` (tweak existing task)
- *"I need to add a back-to-top button"* → Triggers `/genesis` (requires new task)

---

## 📁 Project Structure

```
your-project/
├── .agent/
│   ├── rules/
│   │   └── agents.md          # 🧠 AI's anchor point
│   ├── workflows/             # Workflow definitions
│   │   ├── genesis.md
│   │   ├── scout.md
│   │   ├── design-system.md
│   │   ├── challenge.md
│   │   ├── blueprint.md
│   │   ├── change.md
│   │   └── explore.md
│   │
│   └── skills/            # Reusable skills
│       ├── concept-modeler/
│       ├── spec-writer/
│       ├── task-planner/
│       └── ...
│
└── genesis/               # Versioned architecture docs
    ├── v1/
    │   ├── 01_PRD.md
    │   ├── 02_ARCHITECTURE.md
    │   ├── 03_ADR/
    │   ├── 05_TASKS.md
    │   └── 07_CHALLENGE_REPORT.md
    └── v2/                # New version on major changes
```

---

## 🤔 FAQ

<details>
<summary><b>Why not just use .cursorrules?</b></summary>

`.cursorrules` defines **how** to write code (style, patterns).  
This framework defines **what** to build (requirements, architecture, tasks).

They solve different problems. You can use both.
</details>

<details>
<summary><b>Does this work with Cursor or Copilot?</b></summary>

No. This framework requires **Agentic AI** capabilities:
- Reading arbitrary files in the workspace
- Writing new files
- Executing commands

Cursor/Copilot don't have these capabilities in their chat interfaces.
</details>

<details>
<summary><b>What's the learning curve?</b></summary>

- **5 minutes**: Understand the concept
- **1 project**: Get comfortable with `/genesis` → `/blueprint` flow
- **3 projects**: Master the full system
</details>

---

## 🙌 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📜 License

[MIT](LICENSE) © 2026

---

<div align="center">

**Made for architects who code, and AIs who think.**

🧠 *"Good architecture isn't written. It's designed."*

</div>
