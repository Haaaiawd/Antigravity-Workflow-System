
<div align="center">

<img src="assets/logo-cli.png" width="260" alt="Anws">

[![License: MIT](https://opensource.org/licenses/MIT)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v2.2.4-7FB5B6)](https://github.com/Haaaiawd/ANWS/releases)
[![Targets](https://img.shields.io/badge/Targets-Windsurf%20%7C%20Claude%20Code%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Codex%20Preview%20%7C%20OpenCode%20%7C%20Trae%20%7C%20Qoder%20%7C%20Kilo%20Code-blueviolet)](https://github.com/Haaaiawd/ANWS)

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

## What's New in v2.2.4

**v2.2.4** updates **`/forge`** (zh/en): **Wave** = **Phase A** (per-task §3.1–3.6) + **Phase B** (wave-end **`code-reviewer` §3.4.5**), **Step 4 §4.0** hard gate before settlement, and **deduped** §3.4.5/§3.4.6 cadence copy so rollup timing is not confused with per-task choices. **`e2e-testing-guide`** (zh/en) adds **PRD RTM**, step-level verdicts, **`PARTIAL_PASS`** / **`INCONCLUSIVE` (maybe)**, **`JourneyScore` (0–3)**, optional **overall** score for release hints, and richer report sections; **§3.4.6** matches that contract.

## What's New in v2.2.2

**v2.2.2** centers the **`/forge`** chain: **`/forge` AUTO** keeps checkpoint ceremony with **`AUTO`** signatures; **`code-reviewer`** follows **wave cadence** (typically **once per wave** at the wave’s last task, with a **~2–3 wave** catch-up if long skipped—not after every task by default); **`e2e-testing-guide`** is **guide first**, then live browser steps when tooling exists—otherwise **guide-only**, never claim “tested” without evidence. **`/change`** handles doc/task backflow only—it **does not run `code-reviewer`** (static fidelity stays in **`/forge` §3.4.5** and **`/challenge`**).

**v2.2.0** shipped closed-loop **challenge**, explicit contract closure, **`code-reviewer`** as static evidence, forge challenge-report gates, and **`e2e-testing-guide`**. Older releases: [GitHub Releases](https://github.com/Haaaiawd/ANWS/releases).

**v2.0.0** was the protocol-level major (unified **`.anws/`**, controlled **`AGENTS.md`**, multi-target projection). Same link for full semver history.

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

- **Update flags**
  - `anws update --check` and `anws update --target` are removed; run `anws update` once to refresh all matched targets
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

## Feature demos

What using Anws looks like in practice: architecture-first **`/genesis`**, **human-in-the-loop** requirement alignment, and **skill** orchestration.

**Deep Thinking & Architecture Design**  
<img src="assets/genesis工作流演示.jpg" width="800" alt="Genesis Workflow">

**Interactive Requirement Alignment**  
<img src="assets/与人类交互确认细节.jpg" width="800" alt="Human Interaction">

**Autonomous Skill Invocation**  
<img src="assets/自主调用skills.jpg" width="800" alt="Skills Execution">

---

## Philosophy

**1. Docs first—specs keep you in command**  
PRD, architecture, tasks, and design land in the repo before code does—so the project doesn’t drift in aimless “vibe runs.” Scope and progress live in `.anws/`, `05_TASKS.md`, and **`AGENTS.md`**: you stay **in control of the system**, not whichever chat window is open.

**2. Full autonomy inside the rails**  
**`/forge` AUTO** is delegation with checkpoints: keep moving inside agreed contracts. **Code review**, **e2e-testing-guide**, and the rest of the template gates keep runs **auditable** and **bounded**. When a wave is executing, it’s reasonable to **walk away—coffee, a walk**—because confidence comes from the spec and gates, not from staring at the model.

**Iteration is the product**  
**`/challenge`** isn’t a one-time rubber stamp; it’s repeated adversarial passes. **Good products and clear ideas are sharpened over cycles**—same as real shipping: each round pulls design, tasks, and implementation back into alignment.

---

## Recommended Workflow

Use Anws as a lifecycle, not just a folder pack.


| Command           | Purpose                                                                     | Input                 | Output                   |
| ----------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------ |
| **`/quickstart`** | Route the user through the correct workflow path                            | Auto-detected state   | Full orchestration       |
| `/genesis`        | Start from zero with PRD and architecture                                   | Vague idea            | PRD, architecture, ADRs  |
| `/probe`          | Analyze a legacy codebase before change                                     | Existing code         | Risk report              |
| `/design-system`  | Design one system in depth                                                  | Architecture overview | System design doc        |
| `/challenge`      | Review design, tasks, and implementation fidelity with adversarial pressure | Docs / tasks / code   | Challenge report         |
| `/blueprint`      | Break architecture into executable work                                     | PRD + architecture    | `05_TASKS.md`            |
| `/forge`          | Turn approved tasks into code with challenge-report and contract gates      | Tasks + review state  | Working implementation   |
| `/change`         | In-version task/contract tweaks (controlled expansion: few new tasks)       | Small scoped change   | Updated task/design docs |
| `/explore`        | Research ambiguous or strategic topics                                      | Topic                 | Exploration report       |
| `/craft`          | Create workflows, skills, and prompts                                       | Creation request      | Reusable assets          |
| `/upgrade`        | Route post-update upgrade work                                              | Update changelog      | Change or genesis path   |


---

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
