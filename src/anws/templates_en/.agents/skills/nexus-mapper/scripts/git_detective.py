#!/usr/bin/env python3
"""
git_detective.py — Git history hotspot and logical file coupling analyzer

Purpose: Analyze Git repository change history to identify hotspot files and logical file coupling pairs
Usage: python git_detective.py <repo_path> [--days 90] [--top-n 20]

Methodology: Adam Tornhill "Your Code as a Crime Scene"
"""

import sys
import json
import argparse
import subprocess
from pathlib import Path
from collections import Counter
from itertools import combinations


def run_git(repo_path: Path, args: list[str]) -> str:
    """Run git command and return stdout. Raise RuntimeError on failure."""
    cmd = ['git', '-C', str(repo_path)] + args
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"git command failed: {' '.join(cmd)}\n{result.stderr.strip()}"
        )
    return result.stdout


def get_commit_file_changes(repo_path: Path, days: int) -> list[list[str]]:
    """
    Return files changed in each commit within the analysis window.

    Output format: [[file1, file2], [file3], ...]
    Use COMMIT:<hash> prefix format for stable parsing.
    """
    output = run_git(repo_path, [
        'log',
        f'--since={days} days ago',
        '--pretty=format:COMMIT:%H',
        '--name-only',
    ])

    commits: list[list[str]] = []
    current_files: list[str] = []

    for line in output.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('COMMIT:'):
            if current_files:
                commits.append(current_files)
                current_files = []
        else:
            current_files.append(line)

    if current_files:
        commits.append(current_files)

    return commits


def compute_hotspots(commits: list[list[str]], top_n: int) -> list[dict]:
    """
    Compute file change frequency hotspots, sorted by changes descending.

    Risk thresholds (Adam Tornhill methodology):
      low:    changes < 5
      medium: 5 <= changes < 15
      high:   changes >= 15
    """
    counter: Counter[str] = Counter()
    for files in commits:
        counter.update(files)

    results = []
    for path, changes in counter.most_common(top_n):
        if changes < 5:
            risk = 'low'
        elif changes < 15:
            risk = 'medium'
        else:
            risk = 'high'
        results.append({'path': path, 'changes': changes, 'risk': risk})

    return results


def compute_coupling_pairs(commits: list[list[str]], top_n: int) -> list[dict]:
    """
    Compute logical file coupling pairs: files changed together in one commit.

    coupling_score = co_changes / min(total_changes_A, total_changes_B)
    Filter: pairs with co_changes < 2 are not output (too noisy).
    """
    pair_counter: Counter[tuple[str, str]] = Counter()
    file_counter: Counter[str] = Counter()

    for files in commits:
        unique_files = list(dict.fromkeys(files))  # De-duplicate while preserving order
        file_counter.update(unique_files)
        if len(unique_files) >= 2:
            for a, b in combinations(sorted(unique_files), 2):
                pair_counter[(a, b)] += 1

    results = []
    for (file_a, file_b), co_changes in pair_counter.most_common():
        if co_changes < 2:
            continue
        min_changes = min(file_counter[file_a], file_counter[file_b])
        score = round(co_changes / min_changes, 3) if min_changes > 0 else 0.0
        results.append({
            'file_a': file_a,
            'file_b': file_b,
            'co_changes': co_changes,
            'coupling_score': score,
        })
        if len(results) >= top_n:
            break

    return results


def get_repo_stats(repo_path: Path, days: int) -> dict:
    """Get commit and author counts within the analysis window."""
    try:
        commit_out = run_git(repo_path, [
            'log', f'--since={days} days ago', '--pretty=format:%H',
        ])
        total_commits = sum(1 for line in commit_out.splitlines() if line.strip())

        author_out = run_git(repo_path, [
            'log', f'--since={days} days ago', '--pretty=format:%ae',
        ])
        total_authors = len({line.strip() for line in author_out.splitlines() if line.strip()})
    except RuntimeError:
        total_commits = 0
        total_authors = 0

    return {'total_commits': total_commits, 'total_authors': total_authors}


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Analyze Git history for hotspots and coupling'
    )
    parser.add_argument('repo_path', help='Target repository path')
    parser.add_argument('--days', type=int, default=90,
                        help='Analysis window in days (default: 90)')
    parser.add_argument('--top-n', type=int, default=20,
                        help='Max items in hotspots/coupling output (default: 20)')
    args = parser.parse_args()

    repo_path = Path(args.repo_path).resolve()
    if not repo_path.exists():
        sys.stderr.write(f"[ERROR] repo_path not found: {repo_path}\n")
        sys.exit(1)
    if not (repo_path / '.git').exists():
        sys.stderr.write(
            f"[ERROR] .git not found in {repo_path}. "
            "This tool requires a git repository.\n"
        )
        sys.exit(1)

    try:
        commits = get_commit_file_changes(repo_path, args.days)
    except RuntimeError as e:
        sys.stderr.write(f"[ERROR] Git command failed: {e}\n")
        sys.exit(1)

    stats = get_repo_stats(repo_path, args.days)
    hotspots = compute_hotspots(commits, args.top_n)
    coupling_pairs = compute_coupling_pairs(commits, args.top_n)

    result = {
        'analysis_period_days': args.days,
        'stats': stats,
        'hotspots': hotspots,
        'coupling_pairs': coupling_pairs,
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
