---
name: nexus-query
description: "Precise, instant code structure queries for active development — answer 'who depends on this interface before I refactor it', 'how many modules break if I change this', 'what is the real impact radius of this feature change', 'which module is the true high-coupling hotspot in this legacy codebase'. Essential before any interface change, continuous refactoring task, sprint work estimation, or when navigating unfamiliar or large legacy codebases. Requires Python 3.10+ and shell. Use nexus-mapper instead when building a full .nexus-map/ knowledge base."
---

# nexus-query — Precise Code Structure Queries


## When to Use

| Scenario | Use |
|------|:----:|
| "What classes/methods are in this file, and what does it depend on?" | Yes |
| "If I change this interface/module, which files are affected?" | Yes |
| "What is the impact radius of this change?" | Yes |
| "Which node is the true core dependency in this project?" | Yes |
| "How is the project roughly partitioned?" | Yes |
| User wants to generate full `.nexus-map/` knowledge base | No -> use nexus-mapper |
| Runtime has no shell execution capability | No |
| Host has no local Python 3.10+ | No |

---

## Prerequisite: Ensure ast_nodes.json Exists

```
Before querying -> check if ast_nodes.json exists
├── Exists (.nexus-map/raw/ast_nodes.json or user-provided path) -> query directly
└── Missing -> run extract_ast.py to generate -> then query
```

```bash
# Default paths (compatible with nexus-mapper .nexus-map/, interchangeable)
AST_JSON="$repo_path/.nexus-map/raw/ast_nodes.json"
GIT_JSON="$repo_path/.nexus-map/raw/git_stats.json"    # optional

# If ast_nodes.json is missing, create dir first, then generate (usually seconds)
mkdir -p "$repo_path/.nexus-map/raw"
python $SKILL_DIR/scripts/extract_ast.py $repo_path > $AST_JSON

# If git risk data needed (optional, only when .git exists)
python $SKILL_DIR/scripts/git_detective.py $repo_path --days 90 > $GIT_JSON
```

> `$SKILL_DIR` is this skill's install path (`.agent/skills/nexus-query` or standalone repo path).

**Dependency install (first use)**:
```bash
pip install -r $SKILL_DIR/scripts/requirements.txt
```

---

## Five Query Modes

```bash
# File skeleton: classes, methods, line numbers, import list
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --file <path>
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --file <path> --git-stats $GIT_JSON

# Reverse dependency: who imports this module (separates source and test files)
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --who-imports <module_or_path>

# Impact radius: upstream dependencies + downstream dependents (X upstream, Y downstream)
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --impact <path>
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --impact <path> --git-stats $GIT_JSON

# Core repo nodes: rank by fan-in (most referenced) and fan-out (references most)
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --hub-analysis [--top N]

# Aggregate structural summary by top-level directory
python $SKILL_DIR/scripts/query_graph.py $AST_JSON --summary
```

### Core Value of Each Mode

| Mode | One-line value | Typical trigger |
|------|-----------|------------|
| `--file` | Understand file skeleton without full source reading, down to exact lines | Before taking over large module; narrow read scope in bug investigation |
| `--who-imports` | Pre-change "blast list" of all callers | Must run before deleting funcs/changing signatures/renaming classes |
| `--impact` | `0 upstream, 24 downstream` shows scope at a glance | Sprint estimation; decide local surgery vs global surgery |
| `--hub-analysis` | Find true high-coupling core without guessing by directory names | Architecture review; technical debt prioritization |
| `--summary` | Build global layered understanding in 5 seconds, more objective than README | First contact with project; identify cyclic-risk regions |

---

## Scenario Quick Reference

| Your question now | Use |
|-------------|--------|
| What classes/methods are in this file, and at what lines | `--file` |
| If I change this interface/delete func, which files must change | `--who-imports` |
| How many modules are ultimately affected by this change | `--impact` |
| How risky is this change (with git heat) | `--impact --git-stats` |
| Which module is true high-coupling core | `--hub-analysis` |
| Overall module distribution and layering | `--summary` |
| Continuous refactoring, need impact chain after one change | `--who-imports` -> `--impact` |
| Estimate workload for technical debt refactor | `--hub-analysis` -> `--impact` |

---

## Execution Rules

**Rule 1: Skeleton before query**
Before using `--impact` or `--who-imports` on a module, preferably run `--file` first to understand responsibilities and imports, reducing misinterpretation of query results.

**Rule 2: git-stats is optional bonus, not hard blocker**
If no `.git` or insufficient history, skip `git_detective.py` and query with AST only.

**Rule 3: Path matching is flexible but verify**
Path fragment matching is supported (e.g., `vision.py` can match `src/core/vision.py`). If result is `[NOT FOUND]`, run `--summary` first to confirm module path format in repo, then query again.

**Rule 4: Present results directly; let numbers speak**
`--impact` output `X upstream, Y downstream` is objective. Report it directly; do not replace with vague wording like "possibly large impact".
