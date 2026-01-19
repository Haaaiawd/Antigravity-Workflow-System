import os
import argparse
import subprocess
import json
import csv
from datetime import datetime
try:
    import lizard
except ImportError:
    print("Error: lizard not installed. Run: pip install lizard")
    exit(1)

def get_git_churn(repo_path: str, days: int) -> dict:
    cmd = [
        "git",
        "-C", repo_path,
        "log",
        f"--since={days}.days.ago",
        "--name-only",
        "--format="
    ]
    try:
        result = subprocess.check_output(cmd, encoding='utf-8')
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")
        return {}
        
    churn_map = {}
    for line in result.splitlines():
        if line.strip():
            file_path = line.strip()
            churn_map[file_path] = churn_map.get(file_path, 0) + 1
            
    return churn_map

def get_complexity(repo_path: str, files: list) -> dict:
    complexity_map = {}
    for file_rel_path in files:
        full_path = os.path.join(repo_path, file_rel_path)
        if not os.path.exists(full_path):
            continue
            
        try:
            analysis = lizard.analyze_file(full_path)
            # Use average cyclomatic complexity (CCN) or max CCN
            # Max CCN is often a better indicator of "scary code"
            max_ccn = 0
            for func in analysis.function_list:
                if func.cyclomatic_complexity > max_ccn:
                    max_ccn = func.cyclomatic_complexity
            
            # File length is also a complexity factor
            nloc = analysis.nloc
            
            complexity_map[file_rel_path] = {
                "max_ccn": max_ccn,
                "nloc": nloc,
                "avg_ccn": analysis.average_cyclomatic_complexity
            }
        except Exception as e:
            # lizard might fail on non-code files
            pass
            
    return complexity_map

def analyze_hotspots(repo_path: str, days: int, output_file: str):
    print(f"Analyzing git churn for past {days} days...")
    churn_data = get_git_churn(repo_path, days)
    
    print("Analyzing code complexity...")
    # Only analyze files that exist and have churn
    target_files = [f for f in churn_data.keys()]
    complexity_data = get_complexity(repo_path, target_files)
    
    hotspots = []
    for file, churn in churn_data.items():
        if file in complexity_data:
            comp = complexity_data[file]
            hotspots.append({
                "file": file,
                "churn": churn,
                "max_ccn": comp["max_ccn"],
                "nloc": comp["nloc"],
                # Simple score: Churn * CCN. 
                # Prompts usually care about this metric.
                "debt_score": churn * comp["max_ccn"] 
            })
    
    # Sort by debt score descending
    hotspots.sort(key=lambda x: x["debt_score"], reverse=True)
    
    # Output
    result = {
        "analysis_date": datetime.now().isoformat(),
        "period_days": days,
        "total_files_analyzed": len(hotspots),
        "hotspots": hotspots[:50] # Top 50
    }
    
    if output_file:
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Hotspot analysis saved to {output_file}")
    else:
        print(json.dumps(result, indent=2))

def main():
    parser = argparse.ArgumentParser(description="Git Hotspot Analysis (Churn vs Complexity)")
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--days", type=int, default=180, help="Analysis period in days")
    parser.add_argument("--output", "-o", help="Output JSON file")
    
    args = parser.parse_args()
    
    analyze_hotspots(args.repo, args.days, args.output)

if __name__ == "__main__":
    main()
