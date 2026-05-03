# PROBE Protocol — Detailed Steps for Each Phase

> This file is the execution blueprint for SKILL.md. After Skill activation, **first step** is to read this file completely in one go.
> Before EMIT, also need to read `references/output-schema.md` (Schema too specific, placed separately to save context during activation).
> For non-standard language support, see `references/language-customization.md` (as needed, not gated).

---

## P — PROFILE Phase

**Pre-validation**
1. Confirm `$repo_path` directory exists
2. Check whether `$repo_path/.git` exists
   - Exists: execute git hotspot analysis
   - Does not exist: record `git analysis skipped`, continue with AST and file tree exploration

**Execution steps**

```bash
# Step 1: Run AST extractor (simultaneously generate filtered file tree)
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# If repo contains languages not covered by built-in, supplement support via command line args
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def" \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# Or use explicit JSON config file (when configuration complex, see references/language-customization.md for details)
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --language-config /custom/path/to/language-config.json \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# Step 2: Run git hotspot analysis (only when .git exists)
python $SKILL_DIR/scripts/git_detective.py $repo_path --days 90 \
  > $repo_path/.nexus-map/raw/git_stats.json
```

> `$SKILL_DIR` is this Skill's installation path (`.agent/skills/nexus-mapper` or independent repo path).
> `$repo_path` is absolute path to target repo.
> `extract_ast.py --file-tree-out` by default excludes `.git/`, `.nexus-map/`, `node_modules/`, `__pycache__/`, `.venv/`, `dist/`, `build/` and other noise directories and files.

**Completion check (any failure → stop, do not enter REASON)**
- [ ] `raw/ast_nodes.json` written (empty `nodes` list is also normal downgrade)
- [ ] `raw/file_tree.txt` not empty
- [ ] If git history exists: `raw/git_stats.json` not empty, contains `hotspots` field
- [ ] If git history does not exist: explicitly recorded this is a no-git downgrade exploration
- [ ] If `ast_nodes.json.stats.known_unsupported_file_counts` not empty: recorded language coverage downgrade
- [ ] If `ast_nodes.json.stats.module_only_file_counts` not empty: recorded which languages only have Module-level coverage
- [ ] If `ast_nodes.json.stats.configured_but_unavailable_file_counts` not empty: recorded this part as uncovered

---

## R — REASON Phase

**Boundary scenario pre-check** (before reading project files, go through following checklist first, if any item hit, adjust execution strategy)

| Scenario                          | Identification method                    | Handling                                                                                     |
| --------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| New repo without git history      | `.git` exists but only 1 commit         | Skip `git_detective.py`, write `git analysis skipped: insufficient history` in output       |
| Non-git repo                      | `.git` does not exist                   | Skip `git_detective.py`, final output mark `hotspots skipped: no git metadata`              |
| Large Monorepo (>1000 files)      | `stats.truncated=true`                   | Inform user to use `--max-nodes 200`; `truncated=true` is expected behavior                  |
| Git history too long (>3000 commits) | Analysis slow / git data too large     | Use `--days 30` instead of default 90 days                                                 |
| Project without README            | No README in root directory             | Skip directly to `pyproject.toml` / `package.json`; hypothesis log note evidence gap          |
| Repo with roadmap/Sprint status   | README/TASKS contains time-sensitive status | Allow summary, must attach `verified_at` and source doc path; prohibited to write undated status as current fact |
| Truncation behavior (truncated=true) | `stats.truncated_nodes > 0`         | Function nodes discarded, will not generate `raw/functions.json`; can produce complete output based on Module/Class nodes |

> [!DEVIATION]
> **Known implementation deviation**: Truncated Function nodes are **directly discarded**, **will not generate** `raw/functions.json`.
> If any document describes truncated nodes written to separate file, actual behavior takes precedence.

**Multi-language coverage layering**

| Status                   | Identification field                                 | EMIT requirement                                                    |
| ------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------- |
| Full structural coverage | `languages_with_structural_queries`                  | Normal output                                                       |
| Module-only coverage     | `module_only_file_counts`                            | Must not describe as "full AST coverage"; fine-grained conclusions must be conservative |
| Configured but parser unavailable | `configured_but_unavailable_file_counts` | Treat as uncovered, not module-only; dependency conclusions only write `inferred` |
| Completely not integrated | `known_unsupported_file_counts`                     | `INDEX.md` mark downgrade; related regions add `inferred/manual inspection` |

**Reading strategy (priority from high to low)**
1. `README.md` / `README.rst` — project overall description
2. `pyproject.toml` / `package.json` / `pom.xml` — tech stack and dependencies
3. Main entry files (`main.py`, `index.ts`, `Application.java`)
4. `raw/file_tree.txt` — directory structure awareness
5. `raw/git_stats.json` hotspots Top 5 — most active files (only when git data available)
6. Test directory — establish static test surface, no need to run tests

**Execution requirements**
- Perform deep thinking, gradually deduce key decision points sufficient to support conclusions, usually 3-5
- Identify repo's main System-level nodes, usually 1-5; do not split pure technical details into independent systems just to pad numbers
- **[Recommended]** Run hub-analysis to validate core system hypothesis with fan-in/fan-out data:
  ```bash
  python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json --hub-analysis
  ```

**Recording format** (working memory, not write file)
```
[REASON LOG]
- System A: inferred responsibility=X, implementation_status=implemented, code_path=Y (confidence: high/medium/low)
- System B: inferred responsibility=X, implementation_status=planned, evidence_path=Y (confidence: high/medium/low)
- Evidence gap: Z directory attribution lacks direct evidence (will challenge in OBJECT)
```

---

## O — OBJECT Phase

**Why challenge needed**: System hypotheses established by first intuition have three typical biases — directory name ≠ responsibility, git hotspots reveal true core, import direction reveals hierarchy errors. Three dimensions (below) systematically cover these three bias types.

**Challenge protocol** — propose minimum set of high-value challenges sufficient to challenge current hypothesis, usually 1-3, each with evidence clues

Challenge point format:
```
Q{N}: [specific contradiction or suspicious point]
Evidence clue: [where contradiction found — file path/line number/git data]
Verification plan: [how to verify in BENCHMARK phase]
```

Unqualified challenges (prohibited to submit):
```
Q1: My grasp of system structure is not solid enough
Q2: xxx directory responsibilities have no direct evidence yet
```
Problem is not wording, but lack of code citation and no executable verification plan.

Qualified example:
```
Q1: git_stats shows tasks/analysis_tasks.py changed 21 times (high risk),
    but REASON thinks orchestration entry is evolution/detective_loop.py.
    Contradiction: If detective_loop is entry, why is analysis_tasks hotter?
    Evidence clue: raw/git_stats.json hotspots[0]
    Verification plan: view tasks/analysis_tasks.py class definition + import tree
```

**Three-dimensional challenge framework** (corresponding to Structure / Evolution / Dependency)

| Dimension   | Data source                                      | High-value challenge pattern                                                                       |
| ----------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Structure   | `raw/file_tree.txt`, ast edges(`contains`)       | Business-named files appear in hypothesized "infrastructure layer" directory; multiple System files in same `utils/` (boundary blurry) |
| Evolution   | `raw/git_stats.json` hotspots + coupling_pairs   | Hotspot top not within hypothesized "core system"; coupling_score > 0.7 file pairs belong to different Systems (boundary wrong) |
| Dependency  | ast edges(`imports`)                            | Hypothesized lower layer module imports upper layer module (circular dependency/layering error); import direction opposite to hypothesis |

**Challenge grading**

| Level     | Definition                                                     | BENCHMARK priority        |
| --------- | --------------------------------------------------------------- | :-----------------------: |
| Critical  | Hypothesized system boundaries completely wrong, `code_path` should point to completely different location | Verify immediately, do not enter EMIT before verification |
| High      | Core system's `code_path` may be wrong or missed important subdirectories | BENCHMARK first batch     |
| Medium    | Subdirectory responsibility division vague, may affect `responsibility` accuracy | BENCHMARK second batch    |

> If evidence only supports Medium, keep Medium. At least one challenge must truly potentially change system boundary, main entry, or dependency direction.

**Three-dimensional execution checklist**
- [ ] Structure: Does file_tree.txt have files/directories that cannot match hypothesized systems?
- [ ] Structure: Do cross-system `utils/`/`common/` directories exist with ambiguous zones?
- [ ] Evolution: When git data available, do hotspot front ranks support "core system" judgment?
- [ ] Evolution: Are there strong coupling pairs across hypothesized system boundaries in coupling_pairs (score > 0.5)?
- [ ] Dependency: Are there import edges violating hypothesized layering direction (lower layer imports upper layer)?
- [ ] Dependency: Are any System's import directions opposite to hypothesized "dependent-dependee" relationship?

---

## B — BENCHMARK Phase

**Execute verification for each challenge point**
1. Use `grep_search` / `view_file` to find specific evidence
2. **[Recommended]** Use `query_graph.py --impact` to view target file's real upstream/downstream dependencies:
   ```bash
   python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json \
     --impact <target file> --git-stats $repo_path/.nexus-map/raw/git_stats.json
   ```
3. Judge result:
   - Challenge valid → correct node's `code_path` or `responsibility`, mark "corrected" in LOG
   - Challenge invalid → confirm original hypothesis, mark "verified"

**Global node validation (execute for all System nodes one by one)**
- [ ] `implemented` node's `code_path` actually exists in repo
- [ ] `planned/inferred` nodes do not fake `code_path`, use `evidence_path + evidence_gap` instead
- [ ] Each `planned/inferred` node's `evidence_path` actually exists in repo
- [ ] `responsibility` expression clear, specific; if evidence insufficient, explicitly record evidence gap
- [ ] Node `id` globally unique, kebab-case, all lowercase

> If key system completely identified incorrectly → allowed to return to REASON to rebuild model, and re-execute OBJECT.

---

## E — EMIT Phase

> [!IMPORTANT]
> **Phase gate**: Before writing any file, must first read:
> `references/output-schema.md`
> Writing without reading that file → produced JSON/Markdown structure cannot pass Schema validation, considered invalid.

**Idempotency check (must do before writing)**

| Check result                             | Handling                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| `.nexus-map/` does not exist             | Continue directly                                    |
| `.nexus-map/` exists and `INDEX.md` valid | Ask user: "Detected existing analysis results, overwrite? [y/n]" |
| `.nexus-map/` exists but files incomplete | "Detected incomplete analysis, will regenerate", continue |

**[Recommended] Get structure summary before writing**
```bash
python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json --summary
```

**Writing order (first write `.tmp/`, after all successful move all together)**
```
1. .nexus-map/.tmp/concepts/concept_model.json   ← Schema V1
2. .nexus-map/.tmp/INDEX.md                       ← L0 summary, < 2000 tokens
3. .nexus-map/.tmp/arch/systems.md                ← each System boundary
4. .nexus-map/.tmp/arch/dependencies.md           ← Mermaid dependency graph
5. .nexus-map/.tmp/arch/test_coverage.md          ← static test surface and evidence gaps
6. .nexus-map/.tmp/concepts/domains.md            ← Domain concept explanation
7. .nexus-map/.tmp/hotspots/git_forensics.md      ← Git hotspot summary
```

All write successful → move `.tmp/` contents to `.nexus-map/` → delete `.tmp/`

**INDEX.md writing requirements**
- token count < 2000, rewrite if exceeded
- Conclusions specific, do not use vague words to dodge; when evidence insufficient, explicitly write `evidence gap` or `unknown`
- **Must include "Operation Guide" hard routing block defined in SKILL.md Rule 4**

**Each Markdown file header must at minimum contain**
```markdown
> generated_by: nexus-mapper v2
> verified_at: 2026-03-07
> provenance: AST-backed except where explicitly marked inferred
```

**Edge merging protocol (execute before writing concept_model.json)**
1. Import edges from `raw/ast_nodes.json` (`imports`/`contains`, machine layer precise)
2. Append semantic edges inferred in BENCHMARK phase (`depends_on`/`calls`)
3. Deduplicate: keep one edge for same `(source, target, type)` triplet

**Completion validation**
- [ ] `INDEX.md` exists, conclusions specific and honest about evidence gaps, < 2000 tokens, contains hard routing block
- [ ] `implemented` nodes in `concept_model.json` all have verified `code_path`
- [ ] `arch/dependencies.md` contains >= 1 Mermaid graph
- [ ] `arch/test_coverage.md` explains static test surface, and explicitly states evidence gap of not running tests
