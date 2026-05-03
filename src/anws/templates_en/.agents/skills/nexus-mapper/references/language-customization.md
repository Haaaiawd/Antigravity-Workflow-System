# Adding Language Support for nexus-mapper

> This file is not a phase gate file. When built-in language coverage is insufficient, subsequent agents should prioritize referencing this file to supplement support via command line arguments; only use explicit JSON config file when configuration is complex.

---

## Goal

The default model of current scripts is:

1. First use built-in extension mapping and built-in Tree-sitter query
2. If built-in coverage insufficient, then agent supplements language support via command line
3. If command line args too many or query too long, then fall back to `--language-config <JSON_FILE>`

This means:

- Does not require repo to have fixed path language config file
- Not recommended to modify core scripts for single repo single analysis
- New agent can directly plug additional languages into analysis flow in one command

---

## Preferred Approach: Command Line Supplement

### Applicable Scenarios

Prioritize command line when following conditions met:

- Repo contains extensions not covered by built-in
- Only need to supplement 1-3 language mappings
- Query is short, suitable for inline in command line

### Step 1: Confirm Language Name

First confirm language name recognizable by `tree-sitter-language-pack` or current environment. For example:

- `.templ` -> `templ`
- `.hbs` -> `handlebars`
- `.rego` -> `rego`

If language name uncertain, first check official grammar name; do not guess a language name and directly write into final conclusion.

### Step 2: Supplement Extension Mapping

```bash
python extract_ast.py <repo_path> \
  --add-extension .templ=templ \
  --add-extension .hbs=handlebars
```

This brings originally unrecognized extensions into language dispatch flow.

### Step 3: Supplement Query as Needed

If only Module-level coverage needed, can stop here.

If need class/function-level structure, continue appending `--add-query`:

```bash
python extract_ast.py <repo_path> \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def"
```

Parameter format:

```text
--add-query <LANG> <TYPE> <QUERY_STRING>
```

Where:

- `<LANG>`: language name, e.g., `templ`
- `<TYPE>`: `struct` or `imports`
- `<QUERY_STRING>`: Tree-sitter query string

Capture naming must continue to follow existing convention:

- Class: `@class.def` / `@class.name`
- Function: `@func.def` / `@func.name`
- Import: `@mod`

---

## Alternative Approach: Explicit JSON Config File

When any of following holds, can use `--language-config`:

- Need to supplement multiple languages, command line already too long
- Query is complex, not suitable for inline in shell command
- Want to centrally save extension mapping and query needed for one analysis

Example:

```json
{
  "extensions": {
    ".templ": "templ",
    ".hbs": "handlebars"
  },
  "queries": {
    "templ": {
      "struct": "(component_declaration name: (identifier) @class.name) @class.def",
      "imports": ""
    }
  },
  "unsupported_extensions": {
    ".legacydsl": "legacydsl"
  }
}
```

Execution method:

```bash
python extract_ast.py <repo_path> --language-config /custom/path/to/language-config.json
```

Explanation:

- `extensions`: extension to language name mapping
- `queries`: custom `struct` / `imports` query
- `unsupported_extensions`: explicitly declare extensions still not currently supported, avoid silent skip

This JSON file is explicit input for one analysis, does not require fixed placement in repo default location.

---

## Coverage Honesty Rules

Whether command line or explicit JSON, new languages must follow same layered standard:

1. `structural coverage`
  Condition: parser loadable, and `struct` query exists
2. `module-only coverage`
  Condition: parser loadable, but no `struct` query
3. `configured-but-unavailable`
  Condition: agent explicitly requested support for this language, but current environment cannot load parser
4. `unsupported`
  Condition: language still not included in this AST flow, or explicitly marked as unsupported

Prohibited:

- Write `configured-but-unavailable` as `module-only`
- Disguise `unsupported` as "not present in repo"

---

## Recommended Decision Order

When subsequent agent encounters an uncovered language, handle in following order:

1. First confirm whether that extension file actually exists in current repo
2. Then confirm whether current environment can load corresponding parser
3. If loadable: prioritize `--add-extension`; supplement `--add-query` when need structure nodes
4. If command too long: switch to `--language-config`
5. If parser cannot load: keep `configured-but-unavailable`, do not fake results

---

## Design Principles

- Built-in languages first, command line supplement second, explicit JSON last
- For single analysis, prioritize minimum extra input, do not modify core scripts first
- Custom query is formal input, not bypass hack
- All new languages must follow same metadata and provenance rules

