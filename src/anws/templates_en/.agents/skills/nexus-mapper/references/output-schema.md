# Output Schema Specification

> **EMIT phase hard gate**: This file is forcibly triggered for reading by EMIT phase gate of `probe-protocol.md`,
> must complete reading this file before writing any `.nexus-map/` file.
> All schemas in this document are corrected based on actual runtime output, consistent with current script version.

---

## raw/ast_nodes.json (extract_ast.py output)

### Top-level structure
```json
{
  "languages": ["cpp", "python"],
  "stats": {
    "total_files": 101,
    "total_lines": 23184,
    "parse_errors": 0,
    "truncated": true,
    "truncated_nodes": 298,
    "supported_file_counts": {"python": 101},
    "languages_with_structural_queries": ["python", "javascript", "typescript"],
    "languages_with_custom_queries": ["gdscript"],
    "module_only_file_counts": {"vue": 12},
    "known_unsupported_file_counts": {"customdsl": 24},
    "configured_but_unavailable_file_counts": {"templ": 6},
    "custom_language_config_paths": ["/custom/path/to/language-config.json"]
  },
  "warnings": [
    "custom language configuration loaded: /custom/path/to/language-config.json",
    "some languages were parsed with module-only coverage because no structural query template is bundled: vue (12 files)",
    "known unsupported languages present; downstream outputs must mark inferred sections explicitly: customdsl (24 files)",
    "some configured languages were detected in source files but no parser could be loaded: templ (6 files)"
  ],
  "nodes": [...],
  "edges": [...]
}
```

### Module node
```json
{
  "id": "src.nexus.application.weaving.treesitter_parser",
  "type": "Module",
  "label": "treesitter_parser",
  "path": "src/nexus/application/weaving/treesitter_parser.py",
  "lines": 320,
  "lang": "python"
}
```

### Class node
```json
{
  "id": "src.nexus.application.weaving.treesitter_parser.TreeSitterParser",
  "type": "Class",
  "label": "TreeSitterParser",
  "path": "src/nexus/application/weaving/treesitter_parser.py",
  "parent": "src.nexus.application.weaving.treesitter_parser",
  "start_line": 15,
  "end_line": 287
}
```

### Edge
```json
{
  "source": "src.nexus.infrastructure",
  "target": "src.nexus.infrastructure.db_client",
  "type": "contains"
}
```

**Edge types**: `contains` (module→class, class→method) / `imports` (import statement parsing)

### warnings field

`warnings` is optional array, used to expose downgrade information that won't cause PROFILE failure but affects downstream credibility, for example:
- grammar loadable, but currently only Module-level coverage
- Known but unsupported languages exist
- AST truncated
- Some parsers unavailable

### Coverage layering fields

| Field                                   | Meaning                                                             |
| --------------------------------------- | ------------------------------------------------------------------- |
| `supported_file_counts`                 | Files successfully entering AST flow (including full structural coverage and module-only coverage) |
| `languages_with_structural_queries`     | Languages covered by current bundled query templates               |
| `languages_with_custom_queries`         | Languages where queries added or overridden via `--add-query` or `--language-config` |
| `module_only_file_counts`               | Languages where grammar loadable, but no structural query currently, only produce Module nodes |
| `known_unsupported_file_counts`         | Languages known to exist but completely not entering AST flow        |
| `configured_but_unavailable_file_counts` | Languages agent explicitly requested support for, but current environment has no available parser |
| `custom_language_config_paths`         | Paths of explicit language config files actually loaded this time; empty in pure CLI mode |

---

## raw/git_stats.json (git_detective.py output)

```json
{
  "analysis_period_days": 90,
  "stats": {
    "total_commits": 42,
    "total_authors": 1
  },
  "hotspots": [
    {"path": "src/nexus/tasks/analysis_tasks.py", "changes": 21, "risk": "high"}
  ],
  "coupling_pairs": [
    {"file_a": "...", "file_b": "...", "co_changes": 5, "coupling_score": 0.71}
  ]
}
```

**Risk threshold**: `changes < 5` → `low` / `5–15` → `medium` / `> 15` → `high`

---

## Generated Markdown file headers

Headers of `INDEX.md`, `arch/*.md`, `concepts/domains.md`, `hotspots/git_forensics.md` must at minimum contain:

```markdown
> generated_by: nexus-mapper v2
> verified_at: 2026-03-07
> provenance: AST-backed except where explicitly marked inferred
```

If language downgrade or manual inference exists, `provenance` must be expanded:

```markdown
> provenance: AST-backed for Python; some custom DSL files were detected but not parsed by bundled AST tooling, so the affected dependency notes below are inferred from file tree and manual inspection.
```

---

## concepts/concept_model.json — Schema V1

Schema V1 human-readable name field only has `label`, do not introduce additional `title`; if `title` appears, treat as non-standard field, should delete.

```json
{
  "$schema": "nexus-mapper/concept-model/v1",
  "generated_at": "2026-03-05T15:00:00Z",
  "repo_path": "/absolute/path/to/repo",
  "generator": "nexus-mapper v2",
  "nodes": [
    {
      "id": "nexus.ast-extractor",
      "type": "System",
      "label": "AST Extractor",
      "responsibility": "Use Tree-sitter to parse Python repo, extract module/class/function nodes and import relationships, output machine-readable JSON",
      "implementation_status": "implemented",
      "code_path": "src/nexus/application/weaving/",
      "evidence_path": null,
      "evidence_gap": null,
      "tech_stack": ["tree-sitter", "python"],
      "related_reqs": ["REQ-101"],
      "complexity": "medium",
      "hotspot": true
    }
  ],
  "edges": [
    {
      "source": "nexus.ast-extractor",
      "target": "nexus.task-dispatcher",
      "type": "depends_on",
      "description": "Optional description"
    }
  ],
  "metadata": {
    "total_files": 101,
    "total_lines": 23184,
    "languages": ["python"],
    "git_commits_analyzed": 42,
    "analysis_days": 90
  }
}
```

### Node field validation rules

| Field                  | Required | Triggers `[!ERROR]` situation                                                      |
| ----------------------- | :------: | ---------------------------------------------------------------------------------- |
| `id`                    |    Yes   | Global duplicate; contains uppercase letters or spaces (must be kebab-case lowercase) |
| `type`                  |    Yes   | Not in enum `System / Domain / Module / Class / Function`                         |
| `label`                 |    Yes   | Empty string                                                                       |
| `title`                 |    No    | Schema V1 does not define this field; if written, treat as extra field            |
| `responsibility`        |    Yes   | Too vague to verify; character count < 10 or > 120                                |
| `implementation_status` |    Yes   | Not in enum `implemented / planned / inferred`                                    |
| `code_path`             | Conditional required | `implementation_status=implemented` but empty; or path does not actually exist in repo |
| `evidence_path`         | Conditional required | `implementation_status=planned/inferred` but empty; or path does not actually exist in repo |
| `evidence_gap`          | Conditional required | `implementation_status=planned/inferred` but empty                                 |

### Node status expression specification

**Implemented node**
```json
{
  "implementation_status": "implemented",
  "code_path": "src/server/",
  "evidence_path": null,
  "evidence_gap": null
}
```

**Planned node**
```json
{
  "implementation_status": "planned",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "Design document mentions Monarch/Executor, but src/agents/monarch/ not found in repo"
}
```

**Inferred node**
```json
{
  "implementation_status": "inferred",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "Repo contains currently unsupported DSL files; this boundary comes from file tree and manual reading"
}
```

---

## query_graph.py output format reference (stdout, not written to file)

### --file

```
=== <file_path> ===
Module: <module_id> (<lines> lines, <lang>)

Classes:
  <ClassName> (L<start>-L<end>)
    ├─ <method_name> (L<start>-L<end>)
    └─ <method_name> (L<start>-L<end>)

Top-level Functions:
  <func_name> (L<start>-L<end>)

Imports:
  → <internal_module> (<path>)
  → <external_package> (external)
```

### --who-imports

```
=== Who imports <module>? ===
Imported by N module(s):
  ← <module_id> (<path>)
```

### --impact

```
=== Impact radius: <file_path> ===

Depends on (this file imports):
  → <module_id> (<path>)

Depended by (other files import this):
  ← <module_id> (<path>)

Impact summary: N upstream dependencies, M downstream dependents

# Following only output when --git-stats passed and that file has hotspot/coupling data
Git risk: high (N changes in 90 days)
Coupled files (co-change):
  - <peer_path> (coupling: 0.XX, N co-changes)
```

### --hub-analysis

```
=== Hub Analysis ===

Top fan-in (most imported by others):
  1. <module_id> — imported by N module(s)  [<path>]

Top fan-out (imports most others):
  1. <module_id> — imports N internal module(s)  [<path>]
```

### --summary

```
=== Directory Summary ===

<dir>/ (N modules, N classes, N functions, N lines)
  Key classes: ClassA, ClassB, ...
  Key imports from: <other_dir>, ...
```
