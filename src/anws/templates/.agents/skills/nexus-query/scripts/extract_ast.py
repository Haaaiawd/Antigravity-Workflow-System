#!/usr/bin/env python3
"""
extract_ast.py — 多语言代码仓库 AST 结构提取器

用途：基于 Tree-sitter 提取代码仓库的模块/类/函数结构，输出 JSON 到 stdout
支持：Python, JavaScript, TypeScript, TSX, Java, Go, Rust, C#, C/C++, Kotlin, Ruby, Swift, PHP, Lua ...
用法：python extract_ast.py <repo_path> [--max-nodes 500]
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Any, Optional, cast


EXCLUDE_DIRS = {'.git', '__pycache__', '.venv', 'venv', 'node_modules',
                'dist', 'build', '.mypy_cache', '.pytest_cache', 'site-packages',
                '.nexus-map', '.tox', '.eggs', 'target', 'cmake-build-debug',
                '.vs', 'out', '_build', 'vendor', '.ruff_cache', '.godot',
                '.idea', '.vscode', '.nox'}

EXCLUDE_FILE_SUFFIXES = ('.import', '.vulkan.cache')

# ── 内建语言配置：从同目录 languages.json 加载 ────────────────────
_LANGUAGES_JSON = Path(__file__).parent / 'languages.json'


def _load_builtin_languages() -> tuple[dict[str, str], dict[str, dict[str, str]], dict[str, str]]:
    """从 languages.json 加载内建的扩展名映射、Tree-sitter 查询和已知不支持的扩展名。"""
    try:
        data = json.loads(_LANGUAGES_JSON.read_text(encoding='utf-8'))
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        sys.stderr.write(f"[ERROR] Failed to load {_LANGUAGES_JSON}: {exc}\n")
        sys.exit(1)

    extensions: dict[str, str] = data.get('extensions', {})
    raw_queries: dict[str, dict[str, str]] = data.get('queries', {})
    unsupported: dict[str, str] = data.get('unsupported_extensions', {})

    # 规范化 queries：确保每个语言都有 struct 和 imports 键
    queries: dict[str, dict[str, str]] = {}
    for lang, parts in raw_queries.items():
        queries[lang] = {
            'struct': parts.get('struct', ''),
            'imports': parts.get('imports', ''),
        }

    return extensions, queries, unsupported


BUILTIN_EXTENSION_MAP, BUILTIN_LANG_QUERIES, BUILTIN_KNOWN_UNSUPPORTED_EXTENSIONS = (
    _load_builtin_languages()
)


def _should_skip_path(repo_path: Path, path: Path) -> bool:
    rel_path = path.relative_to(repo_path)
    if any(part in EXCLUDE_DIRS for part in rel_path.parts):
        return True
    if path.is_file() and any(path.name.endswith(suffix) for suffix in EXCLUDE_FILE_SUFFIXES):
        return True
    return False


def write_filtered_file_tree(repo_path: Path, output_path: Path) -> None:
    lines: list[str] = []
    for path in sorted(repo_path.rglob('*')):
        if _should_skip_path(repo_path, path):
            continue
        rel_path = path.relative_to(repo_path).as_posix()
        suffix = '/' if path.is_dir() else ''
        lines.append(rel_path + suffix)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text('\n'.join(lines) + ('\n' if lines else ''), encoding='utf-8')

def _normalize_extension(ext: str) -> str:
    normalized = ext.strip().lower()
    if not normalized:
        raise ValueError('extension must not be empty')
    if not normalized.startswith('.'):
        normalized = f'.{normalized}'
    return normalized


def _copy_lang_queries(source: dict[str, dict[str, str]]) -> dict[str, dict[str, str]]:
    return {
        lang: {
            'struct': query_parts.get('struct', ''),
            'imports': query_parts.get('imports', ''),
        }
        for lang, query_parts in source.items()
    }


def _apply_cli_customizations(
    cli_extensions: list[str] | None,
    cli_queries: list[list[str]] | None,
) -> tuple[
    dict[str, str],
    dict[str, dict[str, str]],
    list[str],
    dict[str, str],
]:
    """
    从命令行参数应用语言自定义（--add-extension 和 --add-query）。
    返回 (extension_override, query_override, warnings)
    """
    extension_override: dict[str, str] = {}
    query_override: dict[str, dict[str, str]] = {}
    warnings: list[str] = []
    custom_query_languages: dict[str, str] = {}

    if cli_extensions:
        for item in cli_extensions:
            if '=' not in item:
                warnings.append(f'ignored invalid extension mapping {item!r}, expected EXT=LANG')
                continue
            ext_part, lang_part = item.split('=', 1)
            try:
                ext = _normalize_extension(ext_part)
                lang = lang_part.strip().lower()
                if not lang:
                    warnings.append(f'ignored empty language name for extension {ext_part!r}')
                    continue
                extension_override[ext] = lang
            except ValueError as e:
                warnings.append(f'ignored invalid extension {ext_part!r}: {e}')
                continue

    if cli_queries:
        for query_item in cli_queries:
            if len(query_item) != 3:
                warnings.append(f'ignored malformed query: expected 3 parts, got {len(query_item)}')
                continue
            lang, query_type, query_str = query_item
            lang = lang.strip().lower()
            if not lang:
                warnings.append('ignored empty language name in query')
                continue
            if query_type not in ('struct', 'imports'):
                warnings.append(f'ignored unknown query type {query_type!r} for language {lang!r}')
                continue

            if lang not in query_override:
                query_override[lang] = {'struct': '', 'imports': ''}
            query_override[lang][query_type] = query_str
            custom_query_languages[lang] = '<cli>'

    return extension_override, query_override, warnings, custom_query_languages


def _load_language_customizations(
    repo_path: Path,
    explicit_config_path: Optional[str],
    cli_extension_override: dict[str, str],
    cli_query_override: dict[str, dict[str, str]],
    cli_warnings: list[str],
    cli_custom_query_languages: dict[str, str],
) -> tuple[
    dict[str, str],
    dict[str, dict[str, str]],
    dict[str, str],
    list[str],
    list[str],
    dict[str, str],
]:
    """
    加载和合并语言自定义配置。
    
    优先级：CLI --language-config > CLI --add-* 参数 > 内置配置
    
    返回 (extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages)
    """
    extension_map = dict(BUILTIN_EXTENSION_MAP)
    lang_queries = _copy_lang_queries(BUILTIN_LANG_QUERIES)
    known_unsupported_extensions = dict(BUILTIN_KNOWN_UNSUPPORTED_EXTENSIONS)
    warnings: list[str] = list(cli_warnings)
    loaded_config_paths: list[str] = []
    custom_query_languages: dict[str, str] = dict(cli_custom_query_languages)

    # 首先合并 CLI 参数的自定义
    extension_map.update(cli_extension_override)
    for lang, query_parts in cli_query_override.items():
        if lang in lang_queries:
            # 只覆盖提供的部分
            if query_parts.get('struct'):
                lang_queries[lang]['struct'] = query_parts['struct']
            if query_parts.get('imports'):
                lang_queries[lang]['imports'] = query_parts['imports']
        else:
            lang_queries[lang] = query_parts

    # 然后加载 --language-config 文件（如果提供），优先级最高
    if explicit_config_path:
        config_path = Path(explicit_config_path)
        resolved_path = config_path if config_path.is_absolute() else (repo_path / config_path)

        try:
            config_data = json.loads(resolved_path.read_text(encoding='utf-8'))
        except FileNotFoundError:
            warnings.append(f'language config not found: {resolved_path}')
            return extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages
        except json.JSONDecodeError as exc:
            warnings.append(f'language config parse error in {resolved_path}: {exc}')
            return extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages
        except OSError as exc:
            warnings.append(f'language config read error in {resolved_path}: {exc}')
            return extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages

        if not isinstance(config_data, dict):
            warnings.append(f'language config ignored because root value is not an object: {resolved_path}')
            return extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages

        loaded_config_paths.append(str(resolved_path))

        # 从 --language-config 加载扩展名映射
        extensions = config_data.get('extensions', {})
        if isinstance(extensions, dict):
            for raw_ext, raw_lang in extensions.items():
                if isinstance(raw_ext, str) and isinstance(raw_lang, str) and raw_lang.strip():
                    try:
                        ext = _normalize_extension(raw_ext)
                        lang = raw_lang.strip().lower()
                        extension_map[ext] = lang
                        known_unsupported_extensions.pop(ext, None)
                    except ValueError:
                        pass

        # 从 --language-config 加载查询
        queries = config_data.get('queries', {})
        if isinstance(queries, dict):
            for raw_lang, raw_query_parts in queries.items():
                if isinstance(raw_lang, str) and raw_lang.strip() and isinstance(raw_query_parts, dict):
                    lang = raw_lang.strip().lower()
                    struct_query = raw_query_parts.get('struct', '')
                    imports_query = raw_query_parts.get('imports', '')
                    if isinstance(struct_query, str) and isinstance(imports_query, str):
                        lang_queries[lang] = {
                            'struct': struct_query,
                            'imports': imports_query,
                        }
                        custom_query_languages[lang] = str(resolved_path)

        # 从 --language-config 加载不支持的扩展名
        unsupported_extensions = config_data.get('unsupported_extensions', {})
        if isinstance(unsupported_extensions, dict):
            for raw_ext, raw_lang in unsupported_extensions.items():
                if isinstance(raw_ext, str) and isinstance(raw_lang, str) and raw_lang.strip():
                    try:
                        ext = _normalize_extension(raw_ext)
                        lang = raw_lang.strip().lower()
                        known_unsupported_extensions[ext] = lang
                        extension_map.pop(ext, None)
                    except ValueError:
                        pass

    return extension_map, lang_queries, known_unsupported_extensions, warnings, loaded_config_paths, custom_query_languages



def _load_languages(
    extension_map: dict[str, str],
    lang_queries: dict[str, dict[str, str]],
    requested: Optional[list[str]] = None,
) -> dict[str, Any]:
    """
    加载 Tree-sitter 语言对象，返回 {lang_name: Language} 字典。
    优先使用 tree-sitter-language-pack（160+ 语言），不可用时回退单语言包。
    """
    try:
        from tree_sitter_language_pack import get_language as _get

        def get_language(name: str) -> Any:
            return _get(cast(Any, name))
    except ImportError:
        # 仅 Python 单语言包 fallback
        try:
            import tree_sitter_python
            from tree_sitter import Language

            def get_language(name: str) -> Any:
                if name == 'python':
                    return Language(tree_sitter_python.language())
                raise LookupError(name)
        except ImportError:
            sys.stderr.write(
                "[ERROR] 缺少 tree-sitter 语言支持。\n"
                "请运行: pip install tree-sitter-language-pack\n"
            )
            sys.exit(1)

    targets = requested if requested else sorted(set(extension_map.values()) | set(lang_queries.keys()))
    languages: dict[str, Any] = {}
    for name in targets:
        try:
            languages[name] = get_language(name)
        except (LookupError, KeyError):
            # 该语言包未安装，优雅跳过
            pass

    if not languages:
        sys.stderr.write("[ERROR] 没有可用的语言解析器，请安装 tree-sitter-language-pack\n")
        sys.exit(1)
    return languages


def _file_module_id(repo_path: Path, file_path: Path) -> str:
    """将文件路径转换为点分隔的模块 ID。
    例：src/nexus/api/routes.py → src.nexus.api.routes
        src/core/parser.hpp   → src.core.parser
    """
    rel = file_path.relative_to(repo_path)
    parts = list(rel.parts)
    stem = Path(parts[-1]).stem  # 去掉扩展名
    parts[-1] = stem
    # Python 特殊处理：__init__ 合并到包路径
    if stem == '__init__' and len(parts) > 1:
        parts = parts[:-1]
    return '.'.join(parts) if parts else stem




def extract_file(
    repo_path: Path,
    file_path: Path,
    lang_name: str,
    language: Any,
    lang_queries: dict[str, dict[str, str]],
) -> tuple[list[dict], list[dict], list[str]]:
    """解析单个源文件，返回 (nodes, edges, errors)"""
    from tree_sitter import Parser as TSParser, Query, QueryCursor

    nodes: list[dict] = []
    edges: list[dict] = []
    errors: list[str] = []

    try:
        source = file_path.read_bytes()
    except OSError as e:
        errors.append(f"{file_path}: read error: {e}")
        return nodes, edges, errors

    try:
        parser = TSParser(language)
        tree = parser.parse(source)
    except Exception as e:
        errors.append(f"{file_path}: parse error: {e}")
        return nodes, edges, errors

    rel_path = str(file_path.relative_to(repo_path)).replace('\\', '/')
    module_id = _file_module_id(repo_path, file_path)
    line_count = source.count(b'\n') + 1

    # Module 节点（文件级）
    nodes.append({
        'id': module_id,
        'type': 'Module',
        'label': module_id.split('.')[-1],
        'path': rel_path,
        'lines': line_count,
        'lang': lang_name,
    })

    queries = lang_queries.get(lang_name, {})

    # ── 结构：类 / 函数 ──────────────────────────────────────────
    struct_q_text = queries.get('struct', '')
    if struct_q_text.strip():
        try:
            struct_query = Query(language, struct_q_text)
            class_ranges: list[tuple[int, int, str]] = []

            for pattern_idx, captures in QueryCursor(struct_query).matches(tree.root_node):
                capture_names = list(captures.keys())
                is_class = any('class' in k for k in capture_names)
                def_key = 'class.def' if is_class else 'func.def'
                name_key = 'class.name' if is_class else 'func.name'

                def_nodes = captures.get(def_key, [])
                name_nodes = captures.get(name_key, [])
                if not def_nodes or not name_nodes:
                    continue

                def_node = def_nodes[0]
                name_node = name_nodes[0]
                name = source[name_node.start_byte:name_node.end_byte].decode('utf-8', 'replace')

                if is_class:
                    node_id = f"{module_id}.{name}"
                    nodes.append({
                        'id': node_id,
                        'type': 'Class',
                        'label': name,
                        'path': rel_path,
                        'parent': module_id,
                        'start_line': def_node.start_point[0] + 1,
                        'end_line': def_node.end_point[0] + 1,
                    })
                    class_ranges.append((def_node.start_byte, def_node.end_byte, node_id))
                    edges.append({'source': module_id, 'target': node_id, 'type': 'contains'})
                else:
                    parent_id = module_id
                    for cls_start, cls_end, cls_id in class_ranges:
                        if cls_start <= def_node.start_byte and def_node.end_byte <= cls_end:
                            parent_id = cls_id
                            break
                    node_id = f"{parent_id}.{name}"
                    nodes.append({
                        'id': node_id,
                        'type': 'Function',
                        'label': name,
                        'path': rel_path,
                        'parent': parent_id,
                        'start_line': def_node.start_point[0] + 1,
                        'end_line': def_node.end_point[0] + 1,
                    })
                    edges.append({'source': parent_id, 'target': node_id, 'type': 'contains'})

        except Exception as e:
            errors.append(f"{file_path}: struct query error: {e}")

    # ── 导入：imports 边 ─────────────────────────────────────────
    import_q_text = queries.get('imports', '')
    if import_q_text.strip():
        try:
            import_query = Query(language, import_q_text)
            for _pattern_idx, captures in QueryCursor(import_query).matches(tree.root_node):
                for mod_node in captures.get('mod', []):
                    target = source[mod_node.start_byte:mod_node.end_byte].decode('utf-8', 'replace').strip('"\'<> ')
                    if target:
                        edges.append({'source': module_id, 'target': target, 'type': 'imports'})
        except Exception as e:
            errors.append(f"{file_path}: import query error: {e}")

    return nodes, edges, errors


def collect_source_files(
    repo_path: Path,
    languages: dict[str, Any],
    extension_map: dict[str, str],
    known_unsupported_extensions: dict[str, str],
) -> tuple[list[tuple[Path, str]], dict[str, int], dict[str, int], dict[str, int]]:
    """收集 repo 中所有已知语言的源文件，跳过排除目录。

    返回：
    - [(file_path, lang_name)]
    - supported_file_counts: {lang_name: file_count}
    - known_unsupported_file_counts: {lang_name: file_count}
    - configured_but_unavailable_file_counts: {lang_name: file_count}
    """
    files: list[tuple[Path, str]] = []
    supported_file_counts: dict[str, int] = {}
    known_unsupported_file_counts: dict[str, int] = {}
    configured_but_unavailable_file_counts: dict[str, int] = {}

    for p in repo_path.rglob('*'):
        if not p.is_file():
            continue
        if _should_skip_path(repo_path, p):
            continue

        suffix = p.suffix.lower()
        lang = extension_map.get(suffix)
        if lang:
            if lang in languages:
                files.append((p, lang))
                supported_file_counts[lang] = supported_file_counts.get(lang, 0) + 1
            else:
                configured_but_unavailable_file_counts[lang] = (
                    configured_but_unavailable_file_counts.get(lang, 0) + 1
                )
            continue

        unsupported_lang = known_unsupported_extensions.get(suffix)
        if unsupported_lang:
            known_unsupported_file_counts[unsupported_lang] = (
                known_unsupported_file_counts.get(unsupported_lang, 0) + 1
            )

    return (
        sorted(files, key=lambda x: x[0]),
        supported_file_counts,
        known_unsupported_file_counts,
        configured_but_unavailable_file_counts,
    )



def apply_max_nodes(
    nodes: list[dict],
    edges: list[dict],
    max_nodes: int,
) -> tuple[list[dict], list[dict], bool, int]:
    """
    节点数超出 max_nodes 时，优先保留 Module/Class，截断 Function。
    返回 (filtered_nodes, filtered_edges, truncated, truncated_count)
    """
    if len(nodes) <= max_nodes:
        return nodes, edges, False, 0

    priority_nodes = [n for n in nodes if n['type'] in ('Module', 'Class')]
    func_nodes = [n for n in nodes if n['type'] == 'Function']

    remaining_slots = max_nodes - len(priority_nodes)
    if remaining_slots < 0:
        kept_nodes = priority_nodes
        truncated_count = len(func_nodes)
    else:
        kept_funcs = func_nodes[:remaining_slots]
        kept_nodes = priority_nodes + kept_funcs
        truncated_count = len(func_nodes) - len(kept_funcs)

    kept_ids = {n['id'] for n in kept_nodes}
    kept_edges = [
        e for e in edges
        if e['source'] in kept_ids or e['type'] == 'imports'
    ]
    return kept_nodes, kept_edges, True, truncated_count


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Extract AST structure from a multi-language repository'
    )
    parser.add_argument('repo_path', help='Target repository path')
    parser.add_argument('--max-nodes', type=int, default=500,
                        help='Max nodes in output (default: 500). Truncates Function nodes first.')
    parser.add_argument(
        '--add-extension',
        action='append',
        dest='add_extensions',
        metavar='EXT=LANG',
        help='Add extension mapping, e.g., .templ=templ. Can be used multiple times.',
    )
    parser.add_argument(
        '--add-query',
        action='append',
        dest='add_queries',
        nargs=3,
        metavar=('LANG', 'TYPE', 'QUERY'),
        help='Add/override a query for a language. TYPE is "struct" or "imports". Can be used multiple times.',
    )
    parser.add_argument(
        '--language-config',
        help='Optional JSON file that adds or overrides extension mappings and tree-sitter queries. Useful for complex configurations.',
    )
    parser.add_argument(
        '--file-tree-out',
        help='Optional output path for a filtered file tree (e.g. .nexus-map/raw/file_tree.txt). Uses the same exclude rules as AST collection.',
    )
    args = parser.parse_args()

    repo_path = Path(args.repo_path).resolve()
    if not repo_path.exists():
        sys.stderr.write(f"[ERROR] repo_path not found: {repo_path}\n")
        sys.exit(1)
    if not (repo_path / '.git').exists():
        sys.stderr.write(f"[WARNING] .git not found in {repo_path}, may not be a git repo\n")

    if args.file_tree_out:
        file_tree_path = Path(args.file_tree_out)
        if not file_tree_path.is_absolute():
            file_tree_path = repo_path / file_tree_path
        write_filtered_file_tree(repo_path, file_tree_path.resolve())

    # 处理 CLI 自定义参数
    cli_ext_override, cli_query_override, cli_warnings, cli_custom_query_languages = _apply_cli_customizations(
        args.add_extensions,
        args.add_queries,
    )

    # 加载和合并配置
    (
        extension_map,
        lang_queries,
        known_unsupported_extensions,
        config_warnings,
        loaded_config_paths,
        custom_query_languages,
    ) = _load_language_customizations(
        repo_path,
        args.language_config,
        cli_ext_override,
        cli_query_override,
        cli_warnings,
        cli_custom_query_languages,
    )

    languages = _load_languages(extension_map, lang_queries)
    (
        source_files,
        supported_file_counts,
        known_unsupported_file_counts,
        configured_but_unavailable_file_counts,
    ) = collect_source_files(
        repo_path,
        languages,
        extension_map,
        known_unsupported_extensions,
    )

    if not source_files:
        sys.stderr.write(f"[WARNING] No supported source files found in {repo_path}\n")

    all_nodes: list[dict] = []
    all_edges: list[dict] = []
    all_errors: list[str] = []
    detected_langs: set[str] = set()
    total_lines = 0
    warnings: list[str] = list(config_warnings)
    module_only_file_counts: dict[str, int] = {}
    languages_with_structural_queries = sorted(
        lang for lang, query_parts in lang_queries.items()
        if query_parts.get('struct', '').strip()
    )

    for file_path, lang_name in source_files:
        nodes, edges, errors = extract_file(
            repo_path,
            file_path,
            lang_name,
            languages[lang_name],
            lang_queries,
        )
        all_nodes.extend(nodes)
        all_edges.extend(edges)
        all_errors.extend(errors)
        if lang_name not in languages_with_structural_queries:
            module_only_file_counts[lang_name] = module_only_file_counts.get(lang_name, 0) + 1
        if nodes:
            detected_langs.add(lang_name)
            total_lines += nodes[0].get('lines', 0)

    final_nodes, final_edges, truncated, truncated_count = apply_max_nodes(
        all_nodes, all_edges, args.max_nodes
    )

    if known_unsupported_file_counts:
        unsupported_summary = ', '.join(
            f"{lang} ({count} files)"
            for lang, count in sorted(known_unsupported_file_counts.items())
        )
        warnings.append(
            "known unsupported languages present; downstream outputs must mark inferred sections explicitly: "
            f"{unsupported_summary}"
        )

    if configured_but_unavailable_file_counts:
        unavailable_summary = ', '.join(
            f"{lang} ({count} files)"
            for lang, count in sorted(configured_but_unavailable_file_counts.items())
        )
        warnings.append(
            'some configured languages were detected in source files but no parser could be loaded: '
            f'{unavailable_summary}'
        )

    if module_only_file_counts:
        module_only_summary = ', '.join(
            f"{lang} ({count} files)"
            for lang, count in sorted(module_only_file_counts.items())
        )
        warnings.append(
            "some languages were parsed with module-only coverage because no structural query template is bundled: "
            f"{module_only_summary}"
        )

    if loaded_config_paths:
        config_summary = ', '.join(loaded_config_paths)
        warnings.append(f'custom language configuration loaded: {config_summary}')

    result = {
        'languages': sorted(detected_langs),
        'stats': {
            'total_files': len(source_files),
            'total_lines': total_lines,
            'parse_errors': len(all_errors),
            'truncated': truncated,
            'truncated_nodes': truncated_count,
            'supported_file_counts': supported_file_counts,
            'languages_with_structural_queries': languages_with_structural_queries,
            'languages_with_custom_queries': sorted(custom_query_languages.keys()),
            'module_only_file_counts': module_only_file_counts,
            'known_unsupported_file_counts': known_unsupported_file_counts,
            'configured_but_unavailable_file_counts': configured_but_unavailable_file_counts,
            'custom_language_config_paths': loaded_config_paths,
        },
        'nodes': final_nodes,
        'edges': final_edges,
    }

    if all_errors:
        result['_errors'] = all_errors[:20]
    if warnings:
        result['warnings'] = warnings

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

