<div align="center">

<img src="assets/logo-cli.png" width="260" alt="Anws">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v2.0.3-7FB5B6)](https://github.com/Haaaiawd/Anws/releases)
[![Targets](https://img.shields.io/badge/Targets-Windsurf%20%7C%20Claude%20Code%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Codex%20Preview%20%7C%20OpenCode%20%7C%20Trae%20%7C%20Qoder%20%7C%20Kilo%20Code-blueviolet)](https://github.com/Haaaiawd/Anws)

[English](./README.md) | [中文](./README_CN.md)

</div>

---

# Anws

**Anws** is a spec-driven workflow framework for AI-assisted development across modern AI IDEs and coding tools.

It helps teams build production-ready software through a disciplined path:

`PRD -> Architecture -> ADR -> Tasks -> Review -> Code -> Upgrade`

Anws enforces design-first principles, preserves context in files, and prevents architectural drift across multi-tool AI coding workflows.

> **TL;DR**: a design-first workflow framework for AI coding tools that turns vibe coding into production-oriented engineering.

## ANWS

- **Axiom** — principle before implementation
- **Nexus** — connection before fragmentation
- **Weave** — coherence before accumulation
- **Sovereignty** — human judgment before automation

---

## Why Anws Exists

Modern AI coding sessions fail in predictable ways:

- **Architecture drift**
  - different sessions generate incompatible structures

- **Context amnesia**
  - a fresh chat loses system decisions, trade-offs, and task state

- **Planning collapse**
  - code gets written before requirements and interfaces are stabilized

- **Unsafe upgrades**
  - workflow files change over time, but existing projects cannot be updated cleanly

Anws addresses those problems with:

- **Versioned architecture docs** under `.anws/v{N}/`
- **A root anchor file** via `AGENTS.md`
- **Workflow-first execution** instead of prompt-only improvisation
- **Controlled update semantics** for `AGENTS.md`, installed targets, and upgrade history

---

## What's New in v2.0.0

`v2.0.0` is a **major release**. It is not just a template refresh; it upgrades the project protocol.

- **Unified architecture root**
  - move from split legacy roots to `.anws/`
  - standardize versioned docs and changelog storage

- **Controlled `AGENTS.md` updates**
  - marker-based merge for modern files
  - automatic migration for recognized legacy files
  - safe preservation for unrecognized legacy files

- **Multi-target projection model**
  - one canonical source
  - multiple target IDE layouts
  - no fake sharing of physical files across targets

- **Codex projection strategy update**
  - Codex is now treated as **Preview**
  - because Codex prompts are no longer available, Anws now packages workflow guidance into `.codex/skills/anws-system/`
  - `SKILL.md` is the navigation shell for the bundle
  - workflow details, including `/quickstart`, now live under `references/*.md`

- **Trae / Qoder / Kilo Code support**
  - Trae follows the same skills-only bundle family as Codex via `.trae/skills/anws-system/`
  - Qoder adds native `.qoder/commands/` + `.qoder/skills/`
  - Kilo Code adds native `.kilocode/workflows/` + `.kilocode/skills/`

- **OpenCode support**
  - adds native projection support for `.opencode/commands/` and `.opencode/skills/`
  - `init`, `update`, manifest ownership, drift detection, and diff flows all understand OpenCode

- **Stronger `anws update` semantics**
  - install-lock aware
  - directory-scan fallback
  - drift detection
  - target-by-target update summary

- **Built-in ecosystem integration**
  - integrates `nexus-skills`
  - adopts `nexus-mapper` as the structural analysis backbone for `/probe`
  - completes the workflow rename from legacy `/scout` to `/probe`

- **Branded CLI experience**
  - unified logo
  - confirmation UI
  - changelog generation
  - release-oriented terminal output

---

## Quick Start

### Install via npm

```bash
npm install -g @haaaiawd/anws
cd your-project
anws init
```

- **Requirement**
  - Node.js `>= 18`

- **Install behavior**
  - `anws init` installs one or more target projections into their native folders
  - example: `anws init --target windsurf,opencode`

### Update an Existing Project

```bash
cd your-project
anws update
```

- **Preview mode**
  - `anws update --check` previews grouped diffs without writing files

- **State source**
  - `anws update` reads `.anws/install-lock.json`
  - if the lock is missing or invalid, it falls back to directory scan
  - if lock drift is detected, directory scan becomes the effective source for the current update
  - a real `anws update` can rebuild `.anws/install-lock.json` from detected targets when fallback is active

- **`AGENTS.md` behavior**
  - marker-based file -> update stable sections, preserve `AUTO` block
  - recognized legacy file -> migrate into new marker-based structure
  - unrecognized legacy file -> warn and preserve unchanged

- **Legacy migration**
  - if a project still has `.agent/`, the CLI can guide migration to `.agents/`
  - after successful migration, interactive mode can also ask whether to delete the old `.agent/`

- **Upgrade record**
  - every successful update refreshes `.anws/changelog/`
  - target state is written back to `.anws/install-lock.json`

---

## Migration Notes for Existing Users

If you used older Anws / Antigravity layouts, `v2.0.0` matters because:

- **Directory protocol changed**
  - old references to `genesis/` and `anws/changelog/` are replaced by `.anws/`

- **`AGENTS.md` is no longer “always skip”**
  - it is now a controlled managed file with merge / migrate / preserve semantics

- **Target installation is explicit**
  - Anws now models target IDEs as first-class projections

If you maintain old docs or release notes, update those references before publishing new project templates.

---

## Compatibility

Anws keeps a **single canonical workflow / skill source**, then projects it into the native directory structure expected by each tool.
Every supported target now receives:

- a root `AGENTS.md`
- a target-native `skills/` projection
- one target-native workflow entry surface, depending on the tool:
  - `workflows`
  - `commands`
  - `prompts`
  - aggregated `skills` for Codex / Trae skills-only bundles

| Environment | Status | Layout |
| --- | --- | --- |
| **Windsurf** | ✅ Full Support | `AGENTS.md` + `.windsurf/workflows/` + `.windsurf/skills/` |
| **Antigravity** | ✅ Full Support | `.agents/workflows/` + `.agents/skills/` + `AGENTS.md` |
| **Claude Code** | ✅ Full Support | `AGENTS.md` + `.claude/commands/` + `.claude/skills/` |
| **GitHub Copilot** | ✅ Full Support | `AGENTS.md` + `.github/prompts/` + `.github/skills/` |
| **Cursor** | ✅ Supported | `AGENTS.md` + `.cursor/commands/` + `.cursor/skills/` |
| **Codex** | ⚠️ Preview | `AGENTS.md` + `.codex/skills/anws-system/` + `.codex/skills/<skill>/` |
| **OpenCode** | ✅ Supported | `AGENTS.md` + `.opencode/commands/` + `.opencode/skills/` |
| **Trae** | ✅ Supported | `AGENTS.md` + `.trae/skills/anws-system/` + `.trae/skills/<skill>/` |
| **Qoder** | ✅ Supported | `AGENTS.md` + `.qoder/commands/` + `.qoder/skills/` |
| **Kilo Code** | ✅ Supported | `AGENTS.md` + `.kilocode/workflows/` + `.kilocode/skills/` |

---

## Recommended Workflow

Use Anws as a lifecycle, not just a folder pack.

| Command | Purpose | Input | Output |
| --- | --- | --- | --- |
| **`/quickstart`** | Route the user through the correct workflow path | Auto-detected state | Full orchestration |
| `/genesis` | Start from zero with PRD and architecture | Vague idea | PRD, architecture, ADRs |
| `/probe` | Analyze a legacy codebase before change | Existing code | Risk report |
| `/design-system` | Design one system in depth | Architecture overview | System design doc |
| `/challenge` | Review design or tasks with adversarial pressure | Docs / tasks | Challenge report |
| `/blueprint` | Break architecture into executable work | PRD + architecture | `05_TASKS.md` |
| `/forge` | Turn approved tasks into code | Tasks | Working implementation |
| `/change` | Modify an existing task only | Small scoped change | Updated task/design docs |
| `/explore` | Research ambiguous or strategic topics | Topic | Exploration report |
| `/craft` | Create workflows, skills, and prompts | Creation request | Reusable assets |
| `/upgrade` | Route post-update upgrade work | Update changelog | Change or genesis path |

---

## Core Principles

### 1. Versioned Architecture

- architecture is **evolved**, not silently edited
- major structural changes move from `.anws/v1` to `.anws/v2`
- ADRs preserve the reason behind the shape of the system

### 2. Filesystem as Memory

- `AGENTS.md` is the recovery anchor
- `.anws/v{N}/` stores durable architecture context
- `.anws/changelog/` records upgrade history for future sessions

### 3. Thinking Before Coding

- workflows force staged reasoning before implementation
- the built-in `sequential-thinking` skill standardizes deep analysis
- review steps exist to catch drift before code lands

---

## Project Layout

```bash
your-project/
├── .anws/
│   ├── install-lock.json
│   ├── changelog/
│   └── v{N}/
├── AGENTS.md
├── .windsurf/
│   ├── workflows/
│   └── skills/
├── .agents/
│   ├── workflows/
│   └── skills/
├── .cursor/
│   ├── commands/
│   └── skills/
├── .claude/
│   ├── commands/
│   └── skills/
├── .github/
│   ├── prompts/
│   └── skills/
├── .opencode/
│   ├── commands/
│   └── skills/
├── .qoder/
│   ├── commands/
│   └── skills/
├── .kilocode/
│   ├── workflows/
│   └── skills/
├── .trae/
│   └── skills/
│       ├── anws-system/
│       │   ├── SKILL.md
│       │   └── references/
│       └── <skill>/
│           └── SKILL.md
└── .codex/
    ├── skills/
    │   ├── anws-system/
    │   │   ├── SKILL.md
    │   │   └── references/
    │   └── <skill>/
    │       └── SKILL.md
```

> One source model. Multiple target layouts. Explicit ownership on disk.

---

## Built with Itself

Anws is dogfooded on its own development.

- **Architecture design**
  - the CLI itself was designed through `/genesis`

- **Task decomposition**
  - implementation work was planned through `/blueprint`

- **Execution**
  - code and doc changes were driven through `/forge`

This repository is both the product and a working reference implementation.

**Deep Thinking & Architecture Design**  
<img src="assets/genesis工作流演示.jpg" width="800" alt="Genesis Workflow">

**Interactive Requirement Alignment**  
<img src="assets/与人类交互确认细节.jpg" width="800" alt="Human Interaction">

**Autonomous Skill Invocation**  
<img src="assets/自主调用skills.jpg" width="800" alt="Skills Execution">

## Contributing

Contributions are welcome. Before opening a PR, make sure changes align with the spec-driven workflow and the target projection model.

---

## License

[MIT](LICENSE) © 2026

---

<div align="center">

**Made for architects who code, and AIs who think.**

*Good architecture isn't written. It's designed.*

</div>
