#!/usr/bin/env python3
"""
git_forensics.py - Git 历史取证与共改分析工具

分析 Git 提交历史，识别与目标文件存在逻辑耦合（co-change）的文件。

依赖:
    - git (命令行工具)

调研结果:
    - 使用 git log 获取目标文件的 commit 列表
    - 对每个 commit，获取所有修改的文件
    - 统计共改频率，识别隐性耦合

用法:
    python git_forensics.py --file ./src/auth/login.ts
    python git_forensics.py --file ./src/auth/login.ts --days 180 --threshold 0.5
"""

import argparse
import json
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# 文件类型分类
FILE_CATEGORIES = {
    "TEST_FILE": ["test", "spec", "__tests__", "tests"],
    "CONFIG_FILE": ["config", ".env", "settings", ".json", ".yaml", ".yml", ".toml"],
    "DOC_FILE": [".md", ".rst", ".txt", "README", "CHANGELOG"],
}


def check_git_available() -> bool:
    """检查 git 是否可用"""
    try:
        subprocess.run(
            ["git", "--version"],
            capture_output=True,
            check=True
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def is_git_repo(path: str) -> bool:
    """检查是否在 git 仓库中"""
    try:
        subprocess.run(
            ["git", "rev-parse", "--git-dir"],
            capture_output=True,
            check=True,
            cwd=path
        )
        return True
    except subprocess.CalledProcessError:
        return False


def check_shallow_clone(cwd: str = ".") -> Tuple[bool, int]:
    """
    检查是否为浅克隆，以及有多少 commit
    
    Returns:
        (is_shallow, commit_count)
    """
    # 检查是否浅克隆
    shallow_file = Path(cwd) / ".git" / "shallow"
    is_shallow = shallow_file.exists()
    
    # 获取 commit 数量
    try:
        result = subprocess.run(
            ["git", "rev-list", "--count", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        commit_count = int(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        commit_count = 0
    
    return is_shallow, commit_count


def categorize_file(file_path: str) -> str:
    """根据文件路径判断类型"""
    lower_path = file_path.lower()
    
    for category, patterns in FILE_CATEGORIES.items():
        for pattern in patterns:
            if pattern in lower_path:
                return category
    
    return "PRODUCTION"


def get_commits_for_file(
    file_path: str,
    days: int = 180,
    cwd: str = "."
) -> List[str]:
    """获取修改过目标文件的 commit 列表"""
    since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    cmd = [
        "git", "log",
        f"--since={since_date}",
        "--pretty=format:%H",
        "--",
        file_path
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        commits = [c.strip() for c in result.stdout.strip().split("\n") if c.strip()]
        return commits
    except subprocess.CalledProcessError as e:
        print(f"Error getting commits: {e.stderr}", file=sys.stderr)
        return []


def get_files_in_commit(commit_hash: str, cwd: str = ".") -> List[str]:
    """获取某次 commit 中修改的所有文件"""
    cmd = [
        "git", "show",
        "--name-only",
        "--pretty=format:",
        commit_hash
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return files
    except subprocess.CalledProcessError:
        return []


def get_file_authors(file_path: str, cwd: str = ".") -> List[str]:
    """获取文件的主要作者"""
    cmd = [
        "git", "log",
        "--pretty=format:%an",
        "--",
        file_path
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        authors = [a.strip() for a in result.stdout.strip().split("\n") if a.strip()]
        # 返回最常见的作者
        author_counts = Counter(authors)
        return [author for author, _ in author_counts.most_common(5)]
    except subprocess.CalledProcessError:
        return []


def get_last_modified(file_path: str, cwd: str = ".") -> Optional[str]:
    """获取文件最后修改日期"""
    cmd = [
        "git", "log",
        "-1",
        "--pretty=format:%ci",
        "--",
        file_path
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        return result.stdout.strip().split()[0] if result.stdout.strip() else None
    except subprocess.CalledProcessError:
        return None


def analyze_co_changes(
    target_file: str,
    days: int = 180,
    threshold: float = 0.5,
    cwd: str = "."
) -> Dict:
    """
    分析共改模式
    
    Args:
        target_file: 目标文件路径
        days: 分析多少天的历史
        threshold: 耦合频率阈值
        cwd: 工作目录
    
    Returns:
        分析结果字典
    """
    # 获取目标文件的 commits
    commits = get_commits_for_file(target_file, days, cwd)
    total_commits = len(commits)
    
    if total_commits == 0:
        return {
            "target_file": target_file,
            "analysis_period_days": days,
            "total_commits_modifying_target": 0,
            "co_changed_files": [],
            "last_modified_date": None,
            "primary_authors": [],
            "analysis": {
                "high_risk_files": [],
                "recommendations": ["目标文件在指定时间段内没有修改记录"]
            }
        }
    
    # 统计共改文件
    co_change_counter = Counter()
    
    for commit in commits:
        files_in_commit = get_files_in_commit(commit, cwd)
        for f in files_in_commit:
            if f != target_file:
                co_change_counter[f] += 1
    
    # 计算共改结果
    co_changed_files = []
    high_risk_files = []
    
    for file_path, count in co_change_counter.most_common(20):
        frequency = round(count / total_commits, 2)
        category = categorize_file(file_path)
        
        entry = {
            "file": file_path,
            "co_change_count": count,
            "frequency": frequency,
            "category": category
        }
        
        # 判断风险等级
        if frequency >= 0.7:
            entry["warning"] = "HIGH_COUPLING"
            if category == "PRODUCTION":
                high_risk_files.append(file_path)
        elif frequency >= threshold:
            entry["warning"] = "MEDIUM_COUPLING"
        
        co_changed_files.append(entry)
    
    # 生成建议
    recommendations = generate_recommendations(target_file, co_changed_files, high_risk_files)
    
    # 获取作者和修改日期
    authors = get_file_authors(target_file, cwd)
    last_modified = get_last_modified(target_file, cwd)
    
    return {
        "target_file": target_file,
        "analysis_period_days": days,
        "total_commits_modifying_target": total_commits,
        "co_changed_files": co_changed_files,
        "last_modified_date": last_modified,
        "primary_authors": authors,
        "analysis": {
            "high_risk_files": high_risk_files,
            "recommendations": recommendations
        }
    }


def generate_recommendations(
    target_file: str,
    co_changed_files: List[Dict],
    high_risk_files: List[str]
) -> List[str]:
    """根据分析结果生成建议"""
    recommendations = []
    
    # 高耦合生产代码建议
    if high_risk_files:
        recommendations.append(
            f"发现 {len(high_risk_files)} 个高耦合生产文件。"
            "考虑：(1) 合并为同一模块；(2) 提取公共接口；(3) 使用事件解耦。"
        )
    
    # 检测测试文件耦合（正常）
    test_files = [f for f in co_changed_files if f["category"] == "TEST_FILE" and f["frequency"] > 0.5]
    if test_files:
        recommendations.append(
            f"检测到 {len(test_files)} 个测试文件高频共改，这是正常的测试-代码耦合。"
        )
    
    # 检测配置文件耦合（可能有问题）
    config_files = [f for f in co_changed_files if f["category"] == "CONFIG_FILE" and f["frequency"] > 0.3]
    if config_files:
        recommendations.append(
            "检测到配置文件频繁与代码一起修改。考虑是否存在硬编码或配置管理问题。"
        )
    
    if not recommendations:
        recommendations.append("未发现明显的耦合问题。")
    
    return recommendations


def get_all_commits(days: int = 180, cwd: str = ".") -> List[str]:
    """获取指定时间段内的所有 commits"""
    since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    cmd = [
        "git", "log",
        f"--since={since_date}",
        "--pretty=format:%H"
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd
        )
        commits = [c.strip() for c in result.stdout.strip().split("\n") if c.strip()]
        return commits
    except subprocess.CalledProcessError as e:
        print(f"Error getting commits: {e.stderr}", file=sys.stderr)
        return []


def analyze_global_coupling(
    days: int = 180,
    threshold: float = 0.3,
    top_n: int = 20,
    cwd: str = "."
) -> Dict:
    """
    全局分析所有文件对的耦合度
    
    Args:
        days: 分析多少天的历史
        threshold: 耦合频率阈值
        top_n: 返回 top N 高耦合文件对
        cwd: 工作目录
    
    Returns:
        分析结果字典
    """
    commits = get_all_commits(days, cwd)
    total_commits = len(commits)
    
    if total_commits == 0:
        return {
            "analysis_type": "global",
            "analysis_period_days": days,
            "total_commits_analyzed": 0,
            "high_coupling_pairs": [],
            "recommendations": ["指定时间段内没有 commit 记录"]
        }
    
    # 统计每对文件的共改次数
    pair_counter = Counter()
    file_commit_count = Counter()  # 每个文件被修改的次数
    
    print(f"分析 {total_commits} 个 commits...", file=sys.stderr)
    
    for i, commit in enumerate(commits):
        if (i + 1) % 50 == 0:
            print(f"  进度: {i + 1}/{total_commits}", file=sys.stderr)
            
        files_in_commit = get_files_in_commit(commit, cwd)
        
        # 更新每个文件的修改次数
        for f in files_in_commit:
            file_commit_count[f] += 1
        
        # 统计文件对
        for i in range(len(files_in_commit)):
            for j in range(i + 1, len(files_in_commit)):
                pair = tuple(sorted([files_in_commit[i], files_in_commit[j]]))
                pair_counter[pair] += 1
    
    # 计算耦合度并排序
    high_coupling_pairs = []
    
    for (file_a, file_b), co_change_count in pair_counter.most_common(top_n * 3):
        # 计算 Jaccard-like 耦合度：共改次数 / max(各自修改次数)
        max_changes = max(file_commit_count[file_a], file_commit_count[file_b])
        frequency = round(co_change_count / max_changes, 2) if max_changes > 0 else 0
        
        if frequency >= threshold:
            category_a = categorize_file(file_a)
            category_b = categorize_file(file_b)
            
            entry = {
                "file_a": file_a,
                "file_b": file_b,
                "co_change_count": co_change_count,
                "frequency": frequency,
                "category_a": category_a,
                "category_b": category_b
            }
            
            # 两个都是生产代码则标记高风险
            if category_a == "PRODUCTION" and category_b == "PRODUCTION":
                if frequency >= 0.7:
                    entry["warning"] = "HIGH_COUPLING"
                elif frequency >= 0.5:
                    entry["warning"] = "MEDIUM_COUPLING"
            
            high_coupling_pairs.append(entry)
            
            if len(high_coupling_pairs) >= top_n:
                break
    
    # 生成建议
    recommendations = []
    high_risk_pairs = [p for p in high_coupling_pairs if p.get("warning") == "HIGH_COUPLING"]
    if high_risk_pairs:
        recommendations.append(
            f"发现 {len(high_risk_pairs)} 对高耦合生产文件，考虑合并或重构。"
        )
    
    if not recommendations:
        recommendations.append("未发现严重的耦合问题。")
    
    return {
        "analysis_type": "global",
        "analysis_period_days": days,
        "total_commits_analyzed": total_commits,
        "total_files_analyzed": len(file_commit_count),
        "high_coupling_pairs": high_coupling_pairs,
        "recommendations": recommendations
    }


def main():
    parser = argparse.ArgumentParser(
        description="Git 历史取证与共改分析工具"
    )
    parser.add_argument(
        "--focus", "--entry",
        dest="focus",
        help="聚焦分析单个文件（可选，不指定则进行全局分析）"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=180,
        help="分析多少天的历史 (默认: 180)"
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.3,
        help="耦合频率阈值 (默认: 0.3)"
    )
    parser.add_argument(
        "--top",
        type=int,
        default=20,
        help="返回 top N 高耦合文件对 (默认: 20)"
    )
    parser.add_argument(
        "--repo",
        default=".",
        help="仓库路径 (默认: 当前目录)"
    )
    parser.add_argument(
        "--format",
        choices=["json", "markdown"],
        default="json",
        help="输出格式 (默认: json)"
    )
    parser.add_argument(
        "--output", "-o",
        help="输出文件路径 (默认: stdout)"
    )
    
    args = parser.parse_args()
    
    # 检查 git
    if not check_git_available():
        print("Error: git is not available.", file=sys.stderr)
        sys.exit(1)
    
    # 检查是否在 git 仓库中
    if not is_git_repo(args.repo):
        print(f"Error: {args.repo} is not a git repository.", file=sys.stderr)
        sys.exit(1)
    
    # 检查浅克隆
    is_shallow, commit_count = check_shallow_clone(args.repo)
    if is_shallow:
        print(f"⚠️  Warning: This is a shallow clone with only {commit_count} commits.", file=sys.stderr)
        print(f"   Analysis results may be unreliable. Use 'git fetch --unshallow' for full history.", file=sys.stderr)
    elif commit_count < 50:
        print(f"⚠️  Warning: Repository has only {commit_count} commits. Results may be limited.", file=sys.stderr)
    
    # 执行分析
    if args.focus:
        # Focus 模式：单文件分析
        print(f"Focus 模式：分析文件 {args.focus}", file=sys.stderr)
        result = analyze_co_changes(
            target_file=args.focus,
            days=args.days,
            threshold=args.threshold,
            cwd=args.repo
        )
    else:
        # 全局模式
        print("全局模式：分析所有文件对的耦合度", file=sys.stderr)
        result = analyze_global_coupling(
            days=args.days,
            threshold=args.threshold,
            top_n=args.top,
            cwd=args.repo
        )
    
    # 添加元数据
    result["metadata"] = {
        "is_shallow_clone": is_shallow,
        "total_repo_commits": commit_count
    }
    
    # 输出
    # 输出
    if args.format == "markdown":
        output_str = format_as_markdown(result)
    else:
        output_str = json.dumps(result, indent=2, ensure_ascii=False)
    
    if args.output:
        Path(args.output).write_text(output_str, encoding="utf-8")
        print(f"Output written to: {args.output}", file=sys.stderr)
    else:
        print(output_str)


def format_as_markdown(result: Dict) -> str:
    """Generate Markdown report from analysis result."""
    lines = ["# Git Forensics Report"]
    
    meta = result.get("metadata", {})
    lines.append(f"**Analysis Period**: {result.get('analysis_period_days')} days | **Commits**: {meta.get('total_repo_commits')} | **Shallow**: {meta.get('is_shallow_clone')}")
    lines.append("")

    if "co_changed_files" in result:
        # Single file analysis
        target = result.get("target_file")
        lines.append(f"## Focus: `{target}`")
        lines.append("")
        
        # Co-change table
        lines.append("### High Coupling Files")
        lines.append("| File | Frequency | Count | Category | Warning |")
        lines.append("|------|-----------|-------|----------|---------|")
        
        for f in result.get("co_changed_files", []):
            warning = f["warning"] if "warning" in f else ""
            lines.append(f"| `{f['file']}` | {f['frequency']} | {f['co_change_count']} | {f['category']} | {warning} |")
        lines.append("")

    elif "high_coupling_pairs" in result:
        # Global analysis
        lines.append("## Global Coupling Analysis")
        lines.append("")
        
        lines.append("### Top Coupled Pairs")
        lines.append("| File A | File B | Frequency | Count | Risk |")
        lines.append("|--------|--------|-----------|-------|------|")
        
        for p in result.get("high_coupling_pairs", []):
            warning = p.get("warning", "")
            lines.append(f"| `{p['file_a']}` | `{p['file_b']}` | {p['frequency']} | {p['co_change_count']} | {warning} |")
        lines.append("")
        
    # Recommendations
    recs = result.get("analysis", {}).get("recommendations", []) or result.get("recommendations", [])
    if recs:
        lines.append("## Recommendations")
        for rec in recs:
             lines.append(f"- {rec}")
    
    return "\n".join(lines)


if __name__ == "__main__":
    main()
