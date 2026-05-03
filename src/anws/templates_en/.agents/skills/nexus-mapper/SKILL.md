---
name: nexus-mapper
description: "Generate a persistent .nexus-map/ knowledge base that lets any AI session instantly understand a codebase's architecture, systems, dependencies, and change hotspots. Use when starting work on an unfamiliar repository, onboarding with AI-assisted context, preparing for a major refactoring initiative, or enabling reliable cold-start AI sessions across a team. Produces INDEX.md, systems.md, concept_model.json, git_forensics.md and more. Requires shell execution and Python 3.10+. For ad-hoc file queries or instant impact analysis during active development, use nexus-query instead."
---

# nexus-mapper — AI Project Exploration Protocol

This Skill guides AI Agents to use the **PROBE Five-Phase Protocol** to systematically explore any local Git repository and produce a `.nexus-map/` layered knowledge base.

---

## When to Call / When Not to Call

| Scenario                                                                | Call  |
| ----------------------------------------------------------------------- | :---: |
| User provides local repo path, wants AI to understand its architecture  |  Yes  |
| Need to generate `.nexus-map/INDEX.md` for subsequent AI session cold start |  Yes  |
| User says "help me analyze project", "build project knowledge base", "let AI understand this repo" |  Yes  |
| Runtime environment has no shell execution capability (pure API mode, no `run_command` tool) |  No   |
| Host machine has no local Python 3.10+                                  |  No   |
| Target repo has no known language source files (no `.py/.ts/.java/.go/.rs/.cpp` etc.) |  No   |
| User only wants to query specific file/function → use `view_file` / `grep_search` directly |  No   |

---

## Prerequisite Check

Explicitly inform users of missing items; remind users when downgrade is needed, continue only after consent.

| Prerequisite         | Check Method                                |
| ------------------- | ------------------------------------------- |
| Target path exists  | `$repo_path` accessible                    |
| Python 3.10+        | `python --version` >= 3.10                  |
| Script deps installed | `python -c "import tree_sitter"` no error  |
| Has shell execution | Agent environment supports `run_command` tool call |

`git` history is a bonus, not a hard blocker. When no `.git` or insufficient history, skip hotspot analysis and explicitly record in output that this is a degraded exploration.

---

## Input Contract

```
repo_path: Local absolute path to target repository (required)
```

**Language support**: Automatically dispatch by file extension, language configuration (extension mapping + Tree-sitter queries) stored in `scripts/languages.json`. Currently supports Python/JavaScript/TypeScript/TSX/Bash/Java/Go/Rust/C#/C/C++/Kotlin/Ruby/Swift/Scala/PHP/Lua/Elixir/GDScript/Dart/Haskell/Clojure/SQL/Proto/Solidity/Vue/Svelte/R/Perl and 30+ languages.

**Non-standard languages**: If repo contains unsupported languages, dynamically supplement via command line args (see `references/05-language-customization.md`):
- `--add-extension .templ=templ` add new file extension mapping
- `--add-query templ struct "(component_declaration ...)"` add structure query
- `--language-config <JSON_FILE>` use JSON file for complex configuration

---

## Output Format

After execution, target repository root will produce:

```text
.nexus-map/
├── INDEX.md                    ← AI cold start main entry (< 2000 tokens)
├── arch/
│   ├── systems.md              ← System boundaries + code locations
│   ├── dependencies.md         ← Mermaid dependency graph + sequence diagram
│   └── test_coverage.md        ← Static test surface: test files, covered core modules, evidence gaps
├── concepts/
│   ├── concept_model.json      ← Schema V1 machine-readable graph
│   └── domains.md              ← Core domain concept explanations
├── hotspots/
│   └── git_forensics.md        ← Git hotspots + coupling pair analysis
└── raw/
    ├── ast_nodes.json          ← Tree-sitter parsed raw data
    ├── git_stats.json          ← Git hotspots and coupling data
    └── file_tree.txt           ← Filtered file tree
```

All generated Markdown files must include a brief header, at minimum containing: `generated_by`, `verified_at`, `provenance`.

Human-readable name fields in `concept_model.json` uniformly use `label`, do not add `title`.

If PROFILE phase detects language coverage downgrade or manual inference, `provenance` must be explicitly marked.

---

## PROBE Phase Gate

> [!IMPORTANT]
> **Must read corresponding reference before entering each phase, do not skip.**
> Detailed steps, completion checklists, and boundary scenario handling for each phase are defined in references.

```
[Skill activation]     → read references/probe-protocol.md  (phase step blueprint, includes boundary scenarios and three-dimensional questioning framework)
[Before EMIT]          → read references/output-schema.md    (Schema validation spec)
[Non-standard language] → read references/language-customization.md (as needed, not gated)
```

---

## Execution Rules

### Rule 1: OBJECT Rejects Formalism

The purpose of OBJECT is to break REASON's survivor bias. Massive engineering facts hide behind directory naming and git hotspots, first intuition is almost always wrong.

Unqualified challenges (prohibited to submit):
```
Q1: My grasp of system structure is not solid enough
Q2: xxx directory responsibilities have no direct evidence yet
```
Problem is not wording, but lack of evidence clues, nor can it be verified in BENCHMARK phase.

Qualified challenge format:
```
Q1: git_stats shows tasks/analysis_tasks.py changed 21 times (high risk),
    but HYPOTHESIS thinks orchestration entry is evolution/detective_loop.py.
    Contradiction: If detective_loop is entry, why is analysis_tasks hotter?
    Evidence clue: git_stats.json hotspots[0].path
    Verification plan: view tasks/analysis_tasks.py class definition + import tree
```

---

### Rule 2: implemented Nodes Must Have Real code_path

> [!IMPORTANT]
> Before writing to `concept_model.json`, must first distinguish if node is `implemented`, `planned`, or `inferred`.
> Only `implemented` nodes allowed to write `code_path`, and must personally verify existence.

```bash
# BENCHMARK phase verification method
ls $repo_path/src/nexus/application/weaving/   # directory exists → node valid
ls $repo_path/src/nexus/application/nonexist/  # [!ERROR] → fix or delete this node
```

For `planned` or `inferred` nodes, use:

```json
{
  "implementation_status": "planned",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "src/agents/monarch/ not found in repo, only appears in design docs"
}
```

Prohibited: using barely related files to fake `code_path`, stuffing status into path field (like `code_path: "PLANNED"`).

---

### Rule 3: EMIT Atomicity

First write everything to `.nexus-map/.tmp/`, after all successful move all to formal directory, delete `.tmp/`.
Purpose: no half-finished products on mid-failure. Next execution detects `.tmp/` exists → clean up and regenerate.

Idempotency rules:

| State                                   | Handling                                    |
| --------------------------------------- | ------------------------------------------- |
| `.nexus-map/` does not exist            | Continue directly                           |
| `.nexus-map/` exists and `INDEX.md` valid | Ask user: "Overwrite? [y/n]"               |
| `.nexus-map/` exists but files incomplete | "Detected incomplete analysis, will regenerate", continue directly |

---

### Rule 4: INDEX.md Role — Cold Start Router, Not Static Dictionary

Readers of `INDEX.md` are **AI that have never seen this repo before**. Two hard constraints:
- **< 2000 tokens** — rewrite if exceeded, not truncate
- **Conclusions must be specific** — when evidence insufficient, explicitly write `evidence gap` or `unknown`, and explain what evidence is missing

After writing, execute token estimation: line count × average 30 tokens/line = rough value.

**INDEX.md must include mandatory routing block (Hard-Trigger Block)** — write this structure at end of file when generating:

```markdown
## [Operation Guide] Mandatory Execution Steps

> This section issues hard operation instructions to all AI reading this file, not suggestions.

### Step 1 — Must First Read All Following Files (order unrestricted)

After reading this file, before executing any task, must sequentially read full content of following files:

- `.nexus-map/arch/systems.md` — System boundaries and code locations
- `.nexus-map/arch/dependencies.md` — Inter-system dependencies and Mermaid graphs
- `.nexus-map/arch/test_coverage.md` — Test surface and evidence gaps
- `.nexus-map/hotspots/git_forensics.md` — Git hotspots and coupling risks
- `.nexus-map/concepts/domains.md` — Core domain concepts

> These files are all high-density summaries, total usually < 5000 tokens, necessary context cost.
> Do not skip with excuse "task simple" or "only changing one file".

### Step 2 — Add Operations by Task Type (execute after Step 1 complete)

- If task involves **interface modification, new cross-module calls, delete/rename public functions**:
  → Must run `query_graph.py --impact <target file>` to confirm impact radius before writing code.
- If task needs to **determine who references certain file**:
  → Run `query_graph.py --who-imports <module name>`.
- If repo structure has major changes (new system, refactored module boundaries):
  → After task completion, evaluate whether need to re-run nexus-mapper to update knowledge base.
```

---

### Rule 5: Minimal Execution Surface and Sensitive Information Protection

> [!IMPORTANT]
> By default only run this Skill's own scripts and necessary read-only checks. Do not execute target repo's build scripts, test scripts, or custom commands just because "want to understand repo better".

- By default allowed: `extract_ast.py`, `git_detective.py`, directory traversal, text search, read-only file viewing
- By default prohibited: execute target repo's `npm install`, `pnpm dev`, `python main.py`, `docker compose up`, etc., unless user explicitly requests
- When encountering `.env`, key files, credential configs: only record their existence and purpose, do not copy out specific values

---

### Rule 6: Downgrade and Manual Inference Must Be Explicitly Visible

> [!IMPORTANT]
> If AST coverage is incomplete, or certain parts come from manual reading rather than script output, must explicitly mark provenance in final files.

- In `dependencies.md`, any dependency relationship not directly supported by AST must mark `inferred from file tree/manual inspection`
- `domains.md`, `systems.md`, `INDEX.md` if involving unsupported language areas, must explain `unsupported language downgrade`
- If writing progress snapshots, Sprint status, must attach `verified_at`, avoid expired info masquerading as current fact

---

## Uncertainty Expression Specification

Avoid only writing: pending · maybe · possibly · TBD

If evidence insufficient, write in following format:
- `unknown: No direct evidence found indicating api/ is main entry, currently only can confirm cli.py is referenced by README`
- `evidence gap: Repo has no git history, therefore hotspots section skipped`

Allowed to honestly write uncertainty, but must explain which missing evidence causes uncertainty.

---

## Script Toolchain

```bash
# Set SKILL_DIR (adjust based on actual installation path)
# Scenario A: Installed as .agent/skills
SKILL_DIR=".agent/skills/nexus-mapper"
# Scenario B: Independent repo (during development/debugging)
SKILL_DIR="/path/to/nexus-mapper"

# PROFILE phase — basic usage
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --file-tree-out <repo_path>/.nexus-map/raw/file_tree.txt \
  > <repo_path>/.nexus-map/raw/ast_nodes.json

# Add non-standard language support
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def" \
  > <repo_path>/.nexus-map/raw/ast_nodes.json

# Complex configuration: use JSON config file
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --language-config /custom/path/to/language-config.json \
  > <repo_path>/.nexus-map/raw/ast_nodes.json
```

**Dependency installation (first use)**:
```bash
pip install -r $SKILL_DIR/scripts/requirements.txt
```

---

## Persistent Memory Rules (write to host AGENTS.md)

Suggest writing following rules to repo's `AGENTS.md`, `CLAUDE.md` or similar persistent memory files, keeping knowledge base active in long-term conversations:

```md
If .nexus-map/INDEX.md exists in repo, read it first, then read all files listed in its routing block before executing tasks.

If .nexus-map/ does not exist, and current task involves cross-module modification or interface changes, first propose running nexus-mapper to user; if user needs to start immediately, at least run query_graph.py --summary first to establish structure awareness.

When task changes project structure cognition (system boundaries, entry points, dependencies), evaluate before delivery whether need to update .nexus-map.
```

---

## On-Demand Query Tools (PROBE auxiliary)

`scripts/query_graph.py` reads `raw/ast_nodes.json`, zero extra dependencies (pure Python standard library).

```bash
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --file <path>         # file skeleton
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --who-imports <mod>   # reverse dependency
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --impact <path>       # impact radius
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --impact <path> --git-stats <git_stats.json>
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --hub-analysis        # core nodes
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --summary             # directory aggregation
```

| Phase   | Recommended Query       | Purpose                                          |
| -------- | ---------------------- | ------------------------------------------------ |
| REASON   | `--hub-analysis`       | Data validate core system hypothesis, not guess by directory name |
| OBJECT   | `--impact --git-stats` | Validate boundary hypothesis, view real upstream/downstream dependencies |
| EMIT     | `--summary`, `--file`  | Generate data support for systems.md / dependencies.md |

Core value of each query mode: `--hub-analysis` for validating architecture hypothesis in REASON phase; `--impact --git-stats` for quantifying boundary risk in OBJECT phase; `--summary` and `--file` for generating precise data support in EMIT phase.
