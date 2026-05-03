---
name: report-template
description: Synthesize all Probe-stage analysis (nexus-mapper, runtime-inspector) into a decision-ready system risk report.
---

# The Synthesizer's Manual

> "Data is not information. Information is not knowledge. Knowledge is not wisdom." -- T.S. Eliot

Your goal is to convert raw analysis into **wisdom architects can act on**.

---

## Mandatory Self-Correction

> [!IMPORTANT]
> Before generating the report, you **must** self-check:
> 1. "Do build boundaries from nexus-mapper align with IPC boundaries from runtime-inspector?"
> 2. "Do high-coupling file pairs from nexus-mapper cross build boundaries?"
> 3. "Are missing components identified by nexus-mapper related to discovered risks?"
> 4. "Is this report complete enough?"

---

## Quick Start

1. **Read template (MANDATORY)**: Read `references/REPORT_TEMPLATE.md`. Your report **must** match this structure exactly.
2. **Synthesize all findings**: Merge outputs from:
   * `nexus-mapper` -> Build Roots, Topology, Coupling Pairs, Hotspots, Entities, Missing Components
   * `runtime-inspector` -> IPC Surfaces, Contract Status
3. **Draft report**: Organize with explicit logical connections.
4. **Publish (CRITICAL)**: You **must** create `.anws/v{N}/00_PROBE_REPORT.md` and write the full report. **Do not** only print in chat. Ensure `.anws/v{N}/` exists.

---

## Completion Checklist

Before moving to next phase, verify:
- [ ] Output file created: `.anws/v{N}/00_PROBE_REPORT.md`
- [ ] Includes: System Fingerprint, Component Map, Risk Matrix, Feature Landing Guide
- [ ] User has confirmed findings

---

## Synthesis Ritual

### 1. Executive Summary
* **Elevator pitch**: Describe system health in 30 seconds.
* **Focus points**: technical debt, key risks, reliability.

### 2. Dark Matter Detection
* Do not only list what exists. **List what is missing**.
* Checklist: logs? error handling? CI/CD? secret management? version handshake?

### 3. Cross-Verification
* **nexus-mapper** says "Workspace managed uniformly"?
* **nexus-mapper** says "High coupling crosses build roots"?
* **Conclusion**: detect hidden logical coupling -> **refactor target**.

### 4. Human Checkpoint
* Force user confirmation: "Is this report complete?"
* **Do not enter Blueprint before this report is signed off**.

---

## Master Rules

1. **No hallucination**: Every claim must link to source files.
2. **Brutal honesty**: Be direct. If it's a mess, say it's a mess.
3. **Action-oriented**: Every listed issue must imply a path (refactor/rewrite/retain).

---

## Toolbox

* `references/REPORT_TEMPLATE.md`: main report template.

---

## Consumers

Direct consumer of this report in `/blueprint` phase:
* **System Architect**: depends on your risk list to design mitigation strategy.

Your analysis quality **directly determines** design quality in the next phase.
