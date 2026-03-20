#!/usr/bin/env python3
"""
query_graph.py — AST 按需查询工具

读取 extract_ast.py 产出的 ast_nodes.json，提供多种查询模式，
输出 agent 易消费的精简文本。

用途：
  - PROBE 流程中辅助 REASON/OBJECT/EMIT 阶段生成认知文件
  - 开发中做 bug 调查、修改影响评估、重构分析

用法：
  python query_graph.py <ast_nodes.json> --file <path>
  python query_graph.py <ast_nodes.json> --who-imports <module_or_path>
  python query_graph.py <ast_nodes.json> --impact <path>
  python query_graph.py <ast_nodes.json> --hub-analysis [--top N]
  python query_graph.py <ast_nodes.json> --summary
"""

import sys
import json
import argparse
from pathlib import Path, PurePosixPath
from collections import defaultdict


class GitStats:
    """git_stats.json 的查询辅助。可选加载，不影响核心 AST 查询。"""

    def __init__(self, data: dict):
        self.period_days: int = data.get('analysis_period_days', 90)
        self.hotspots: dict[str, dict] = {}  # path → {changes, risk}
        for h in data.get('hotspots', []):
            self.hotspots[h['path']] = h
        self.coupling: dict[str, list[dict]] = defaultdict(list)  # path → [{peer, co_changes, score}]
        for c in data.get('coupling_pairs', []):
            self.coupling[c['file_a']].append({
                'peer': c['file_b'], 'co_changes': c['co_changes'],
                'score': c['coupling_score'],
            })
            self.coupling[c['file_b']].append({
                'peer': c['file_a'], 'co_changes': c['co_changes'],
                'score': c['coupling_score'],
            })

    def file_risk(self, path: str) -> dict | None:
        return self.hotspots.get(path)

    def file_coupling(self, path: str) -> list[dict]:
        return sorted(self.coupling.get(path, []), key=lambda x: x['score'], reverse=True)

    RISK_ICON = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}

    def format_risk_block(self, path: str) -> list[str]:
        """为一个文件生成 git 风险 + 耦合的文本行（空列表表示无数据）。"""
        lines: list[str] = []
        risk = self.file_risk(path)
        if risk:
            icon = self.RISK_ICON.get(risk['risk'], '⚪')
            lines.append(f"Git risk: {icon} {risk['risk']} ({risk['changes']} changes in {self.period_days} days)")
        coupling = self.file_coupling(path)
        if coupling:
            lines.append("Coupled files (co-change):")
            for c in coupling[:5]:
                lines.append(f"  - {c['peer']} (coupling: {c['score']:.2f}, {c['co_changes']} co-changes)")
        return lines


class ASTGraph:
    """内存中的 AST 图索引，支持多种查询模式。"""

    SOURCE_ROOT_MARKERS = (
        ('src',),
        ('backend', 'src'),
        ('frontend', 'src'),
        ('client', 'src'),
        ('src', 'main', 'python'),
        ('src', 'test', 'python'),
        ('src', 'main', 'java'),
        ('src', 'test', 'java'),
        ('src', 'main', 'kotlin'),
        ('src', 'test', 'kotlin'),
    )

    def __init__(self, data: dict, git_stats: GitStats | None = None):
        self.data = data
        self.nodes: list[dict] = data.get('nodes', [])
        self.edges: list[dict] = data.get('edges', [])
        self.stats: dict = data.get('stats', {})
        self.languages: list[str] = data.get('languages', [])
        self.git: GitStats | None = git_stats

        # 索引
        self.nodes_by_id: dict[str, dict] = {}
        self.nodes_by_path: dict[str, list[dict]] = defaultdict(list)
        self.modules_by_path: dict[str, dict] = {}
        self.imports_forward: dict[str, set[str]] = defaultdict(set)
        self.imports_reverse: dict[str, set[str]] = defaultdict(set)
        self.internal_imports_forward: dict[str, set[str]] = defaultdict(set)
        self.internal_imports_reverse: dict[str, set[str]] = defaultdict(set)
        self.contains_children: dict[str, list[dict]] = defaultdict(list)
        self.path_to_module_id: dict[str, str] = {}
        self.alias_to_module_ids: dict[str, set[str]] = defaultdict(set)

        self._build_index()

    def _build_index(self) -> None:
        for node in self.nodes:
            nid = node['id']
            self.nodes_by_id[nid] = node
            path = node.get('path', '')
            if path:
                self.nodes_by_path[path].append(node)
            if node['type'] == 'Module' and path:
                self.modules_by_path[path] = node
                self.path_to_module_id[path] = nid
                for alias in self._module_aliases(nid, path):
                    self.alias_to_module_ids[alias].add(nid)

        for edge in self.edges:
            src, tgt, etype = edge['source'], edge['target'], edge['type']
            if etype == 'imports':
                self.imports_forward[src].add(tgt)
                self.imports_reverse[tgt].add(src)
            elif etype == 'contains':
                child = self.nodes_by_id.get(tgt)
                if child:
                    self.contains_children[src].append(child)

        module_ids = {n['id'] for n in self.nodes if n['type'] == 'Module'}
        for source, targets in self.imports_forward.items():
            if source not in module_ids:
                continue
            for target in targets:
                resolved = self.resolve_import_target(target)
                if resolved and resolved in module_ids and resolved != source:
                    self.internal_imports_forward[source].add(resolved)
                    self.internal_imports_reverse[resolved].add(source)

    def _module_aliases(self, module_id: str, path: str) -> set[str]:
        aliases = {module_id}
        parts = list(PurePosixPath(path.replace('\\', '/')).parts)
        if not parts:
            return aliases

        stem = PurePosixPath(parts[-1]).stem
        normalized_parts = parts[:-1] if stem == '__init__' else parts[:-1] + [stem]

        for marker in self.SOURCE_ROOT_MARKERS:
            if tuple(normalized_parts[:len(marker)]) == marker and len(normalized_parts) > len(marker):
                aliases.add('.'.join(normalized_parts[len(marker):]))

        for idx, part in enumerate(normalized_parts):
            if part == 'src' and idx + 1 < len(normalized_parts):
                aliases.add('.'.join(normalized_parts[idx + 1:]))

        return {alias for alias in aliases if alias}

    def resolve_import_target(self, target: str) -> str | None:
        if target in self.nodes_by_id and self.nodes_by_id[target]['type'] == 'Module':
            return target

        direct = self.alias_to_module_ids.get(target)
        if direct and len(direct) == 1:
            return next(iter(direct))

        parts = target.split('.')
        while len(parts) > 1:
            parts = parts[:-1]
            candidate = '.'.join(parts)
            matches = self.alias_to_module_ids.get(candidate)
            if matches and len(matches) == 1:
                return next(iter(matches))

        return None

    def _classify_imports(self, imports: set[str]) -> tuple[list[tuple[str, str]], list[str]]:
        internal: list[tuple[str, str]] = []
        external: list[str] = []
        for imp in sorted(imports):
            resolved = self.resolve_import_target(imp)
            if resolved:
                internal.append((imp, resolved))
            else:
                external.append(imp)
        return internal, external

    def resolve_to_module_id(self, query: str) -> str | None:
        """将文件路径或 module id 统一解析为 module id。"""
        # 尝试直接作为 module id
        if query in self.nodes_by_id and self.nodes_by_id[query]['type'] == 'Module':
            return query
        # 尝试作为文件路径（兼容 \\ 和 /）
        normalized = query.replace('\\', '/')
        if normalized in self.path_to_module_id:
            return self.path_to_module_id[normalized]
        # 模糊匹配：去掉开头的 repo 相对路径前缀
        for path, mid in self.path_to_module_id.items():
            if path.endswith(normalized) or normalized.endswith(path):
                return mid
        return None

    def resolve_to_path(self, module_id: str) -> str | None:
        """将 module id 解析为文件路径。"""
        node = self.nodes_by_id.get(module_id)
        if node:
            return node.get('path')
        return None

    # ── 查询模式实现 ──────────────────────────────────────────────

    def query_file(self, file_query: str) -> str:
        """--file: 查看某个文件的完整结构和 import 清单。"""
        mid = self.resolve_to_module_id(file_query)
        if not mid:
            return f"[NOT FOUND] No module matching '{file_query}'"

        module_node = self.nodes_by_id[mid]
        path = module_node.get('path', mid)
        lines = module_node.get('lines', '?')
        lang = module_node.get('lang', '?')

        out = [f"=== {path} ==="]
        out.append(f"Module: {mid} ({lines} lines, {lang})")
        out.append("")

        # 类和函数
        classes = [n for n in self.contains_children.get(mid, []) if n['type'] == 'Class']
        top_funcs = [n for n in self.contains_children.get(mid, []) if n['type'] == 'Function']

        if classes:
            out.append("Classes:")
            for cls in classes:
                sl = cls.get('start_line', '?')
                el = cls.get('end_line', '?')
                out.append(f"  {cls['label']} (L{sl}-L{el})")
                methods = [n for n in self.contains_children.get(cls['id'], []) if n['type'] == 'Function']
                for i, m in enumerate(methods):
                    prefix = "└─" if i == len(methods) - 1 else "├─"
                    ml = m.get('start_line', '?')
                    me = m.get('end_line', '?')
                    out.append(f"    {prefix} {m['label']} (L{ml}-L{me})")
            out.append("")

        if top_funcs:
            out.append("Top-level Functions:")
            for f in top_funcs:
                sl = f.get('start_line', '?')
                el = f.get('end_line', '?')
                out.append(f"  {f['label']} (L{sl}-L{el})")
            out.append("")

        # Imports
        imports = sorted(self.imports_forward.get(mid, set()))
        if imports:
            internal, external = self._classify_imports(set(imports))
            out.append("Imports:")
            for raw_imp, resolved_imp in internal:
                imp_path = self.resolve_to_path(resolved_imp)
                suffix = f" ({imp_path})" if imp_path else ""
                if raw_imp == resolved_imp:
                    out.append(f"  → {raw_imp}{suffix}")
                else:
                    out.append(f"  → {raw_imp}  [resolved: {resolved_imp}{suffix}]")
            for imp in external:
                out.append(f"  → {imp} (external)")
            out.append("")

        if not classes and not top_funcs and not imports:
            out.append("(no classes, functions, or imports detected)")

        # Git stats (可选)
        if self.git:
            git_lines = self.git.format_risk_block(path)
            if git_lines:
                out.append("Git:")
                out.extend(f"  {l}" for l in git_lines)
                out.append("")

        return "\n".join(out)

    def query_who_imports(self, module_query: str) -> str:
        """--who-imports: 反向依赖查询。"""
        mid = self.resolve_to_module_id(module_query)

        # 也尝试直接在 imports_reverse 中查找（处理外部包名等）
        if not mid:
            # 可能是部分匹配（如 'flask' 在 imports target 中）
            matches = set()
            normalized = module_query.replace('\\', '/')
            for target, sources in self.imports_reverse.items():
                if target == normalized or target == module_query:
                    matches.update(sources)
            if matches:
                return self._format_who_imports(module_query, matches)
            return f"[NOT FOUND] No module matching '{module_query}'"

        importers: set[str] = set(self.internal_imports_reverse.get(mid, set()))

        return self._format_who_imports(mid, importers)

    def _format_who_imports(self, query: str, importers: set[str]) -> str:
        out = [f"=== Who imports {query}? ==="]
        if not importers:
            out.append("Not imported by any module in the project.")
            return "\n".join(out)

        out.append(f"Imported by {len(importers)} module(s):")
        for imp in sorted(importers):
            imp_path = self.resolve_to_path(imp)
            suffix = f" ({imp_path})" if imp_path else ""
            out.append(f"  ← {imp}{suffix}")
        return "\n".join(out)

    def query_impact(self, file_query: str) -> str:
        """--impact: 影响半径分析（上下游依赖一览）。"""
        mid = self.resolve_to_module_id(file_query)
        if not mid:
            return f"[NOT FOUND] No module matching '{file_query}'"

        module_node = self.nodes_by_id[mid]
        path = module_node.get('path', mid)

        out = [f"=== Impact radius: {path} ===", ""]

        # 上游：本文件 import 了谁
        forward = sorted(self.imports_forward.get(mid, set()))
        internal_forward, external_forward = self._classify_imports(set(forward))

        out.append("Depends on (this file imports):")
        if internal_forward:
            for raw_dep, resolved_dep in internal_forward:
                dep_path = self.resolve_to_path(resolved_dep)
                suffix = f" ({dep_path})" if dep_path else ""
                if raw_dep == resolved_dep:
                    out.append(f"  → {raw_dep}{suffix}")
                else:
                    out.append(f"  → {raw_dep}  [resolved: {resolved_dep}{suffix}]")
        if external_forward:
            for dep in external_forward:
                out.append(f"  → {dep} (external)")
        if not forward:
            out.append("  (none)")
        out.append("")

        # 下游：谁 import 了本文件
        importers: set[str] = set(self.internal_imports_reverse.get(mid, set()))

        out.append("Depended by (other files import this):")
        if importers:
            for imp in sorted(importers):
                imp_path = self.resolve_to_path(imp)
                suffix = f" ({imp_path})" if imp_path else ""
                out.append(f"  ← {imp}{suffix}")
        else:
            out.append("  (none)")
        out.append("")

        downstream_count = len(importers)
        upstream_count = len({resolved for _raw, resolved in internal_forward})
        out.append(
            f"Impact summary: {upstream_count} upstream dependencies, "
            f"{downstream_count} downstream dependents"
        )

        # Git stats (可选)
        if self.git:
            out.append("")
            git_lines = self.git.format_risk_block(path)
            if git_lines:
                out.extend(git_lines)

        return "\n".join(out)

    def query_hub_analysis(self, top_n: int = 10) -> str:
        """--hub-analysis: 高扇入/高扇出核心节点识别。"""
        fan_in = {target: len(sources) for target, sources in self.internal_imports_reverse.items()}
        fan_out = {source: len(targets) for source, targets in self.internal_imports_forward.items()}

        out = ["=== Hub Analysis ===", ""]

        # Top fan-in
        top_fan_in = sorted(fan_in.items(), key=lambda x: x[1], reverse=True)[:top_n]
        out.append("Top fan-in (most imported by others):")
        if top_fan_in:
            for i, (mid, count) in enumerate(top_fan_in, 1):
                path = self.resolve_to_path(mid) or ""
                out.append(f"  {i}. {mid} — imported by {count} module(s)  [{path}]")
        else:
            out.append("  (no internal import relationships found)")
        out.append("")

        # Top fan-out
        top_fan_out = sorted(fan_out.items(), key=lambda x: x[1], reverse=True)[:top_n]
        out.append("Top fan-out (imports most others):")
        if top_fan_out:
            for i, (mid, count) in enumerate(top_fan_out, 1):
                path = self.resolve_to_path(mid) or ""
                out.append(f"  {i}. {mid} — imports {count} internal module(s)  [{path}]")
        else:
            out.append("  (no internal import relationships found)")

        return "\n".join(out)

    def query_summary(self) -> str:
        """--summary: 按顶层目录聚合的结构摘要。"""
        # 按第一级或第二级目录聚合
        dir_stats: dict[str, dict] = defaultdict(
            lambda: {'modules': 0, 'classes': 0, 'functions': 0, 'lines': 0,
                     'class_names': [], 'import_dirs': set()}
        )

        # 决定聚合粒度：取 path 的前 2 级目录
        def _dir_key(path: str) -> str:
            parts = path.split('/')
            if len(parts) <= 2:
                return parts[0] + '/'
            return '/'.join(parts[:2]) + '/'

        for node in self.nodes:
            path = node.get('path', '')
            if not path:
                continue
            dk = _dir_key(path)
            ntype = node['type']
            if ntype == 'Module':
                dir_stats[dk]['modules'] += 1
                dir_stats[dk]['lines'] += node.get('lines', 0)
            elif ntype == 'Class':
                dir_stats[dk]['classes'] += 1
                dir_stats[dk]['class_names'].append(node['label'])
            elif ntype == 'Function':
                dir_stats[dk]['functions'] += 1

        # 收集每个目录的 import 来源目录
        for mid, targets in self.imports_forward.items():
            src_node = self.nodes_by_id.get(mid)
            if not src_node or src_node['type'] != 'Module':
                continue
            src_path = src_node.get('path', '')
            if not src_path:
                continue
            src_dk = _dir_key(src_path)
            for t in targets:
                t_node = self.nodes_by_id.get(t)
                if t_node and t_node.get('path'):
                    t_dk = _dir_key(t_node['path'])
                    if t_dk != src_dk:
                        dir_stats[src_dk]['import_dirs'].add(t_dk.rstrip('/'))

        out = ["=== Directory Summary ===", ""]

        for dk in sorted(dir_stats.keys()):
            s = dir_stats[dk]
            out.append(
                f"{dk} ({s['modules']} modules, {s['classes']} classes, "
                f"{s['functions']} functions, {s['lines']} lines)"
            )
            if s['class_names']:
                # 最多显示 8 个
                names = s['class_names'][:8]
                suffix = f" ... +{len(s['class_names']) - 8}" if len(s['class_names']) > 8 else ""
                out.append(f"  Key classes: {', '.join(names)}{suffix}")
            import_dirs = sorted(s['import_dirs'])
            if import_dirs:
                out.append(f"  Key imports from: {', '.join(import_dirs)}")
            else:
                out.append(f"  Key imports from: (none / external only)")
            out.append("")

        if not dir_stats:
            out.append("(no modules found in ast_nodes.json)")

        return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Query AST graph from ast_nodes.json',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ast_nodes.json --file src/server/handler.py
  %(prog)s ast_nodes.json --who-imports src.server.handler
  %(prog)s ast_nodes.json --impact src/server/handler.py
  %(prog)s ast_nodes.json --hub-analysis --top 10
  %(prog)s ast_nodes.json --summary
""",
    )
    parser.add_argument('ast_json', help='Path to ast_nodes.json')
    parser.add_argument('--file', dest='file_query', help='Show structure and imports of a file')
    parser.add_argument('--who-imports', dest='who_imports', help='Find modules that import the given module')
    parser.add_argument('--impact', dest='impact_query', help='Show impact radius (deps + dependents)')
    parser.add_argument('--hub-analysis', action='store_true', help='Show top fan-in/fan-out modules')
    parser.add_argument('--summary', action='store_true', help='Show per-directory structural summary')
    parser.add_argument('--top', type=int, default=10, help='Number of results for hub-analysis (default: 10)')
    parser.add_argument('--git-stats', dest='git_stats_path', metavar='GIT_STATS_JSON',
                        help='Optional git_stats.json to enrich --file and --impact with risk/coupling data')

    args = parser.parse_args()

    # 检查至少有一个查询模式
    has_query = any([args.file_query, args.who_imports, args.impact_query,
                     args.hub_analysis, args.summary])
    if not has_query:
        parser.print_help()
        sys.exit(1)

    # 加载 JSON
    ast_path = Path(args.ast_json)
    if not ast_path.exists():
        sys.stderr.write(f"[ERROR] File not found: {ast_path}\n")
        sys.exit(1)

    try:
        raw_text = ast_path.read_text(encoding='utf-8')
        # 跳过可能混入的 stderr 行（如 [WARNING]），定位到第一个 '{' 开始解析
        json_start = raw_text.find('{')
        if json_start < 0:
            sys.stderr.write(f"[ERROR] No JSON object found in {ast_path}\n")
            sys.exit(1)
        data = json.loads(raw_text[json_start:])
    except json.JSONDecodeError as e:
        sys.stderr.write(f"[ERROR] Invalid JSON: {e}\n")
        sys.exit(1)

    # 可选加载 git stats
    git_stats: GitStats | None = None
    if args.git_stats_path:
        gs_path = Path(args.git_stats_path)
        if not gs_path.exists():
            sys.stderr.write(f"[WARNING] git_stats file not found: {gs_path}, ignoring\n")
        else:
            try:
                gs_data = json.loads(gs_path.read_text(encoding='utf-8'))
                git_stats = GitStats(gs_data)
            except (json.JSONDecodeError, KeyError) as e:
                sys.stderr.write(f"[WARNING] git_stats parse error: {e}, ignoring\n")

    graph = ASTGraph(data, git_stats=git_stats)

    # 执行查询
    if args.file_query:
        print(graph.query_file(args.file_query))
    elif args.who_imports:
        print(graph.query_who_imports(args.who_imports))
    elif args.impact_query:
        print(graph.query_impact(args.impact_query))
    elif args.hub_analysis:
        print(graph.query_hub_analysis(args.top))
    elif args.summary:
        print(graph.query_summary())


if __name__ == '__main__':
    main()
