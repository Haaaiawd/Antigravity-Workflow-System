import os
import argparse
import json
import re

# Simple regex for finding potential domain terms (Classes, Structs)
# This is a heuristic. For better results, use the tree-sitter slice we built earlier.
# But for "Concept Modeling" of a whole repo, a fast scan is often enough to start.

PATTERNS = {
    'python': [r'class\s+([A-Z][a-zA-Z0-9_]*)'],
    'rust': [r'struct\s+([A-Z][a-zA-Z0-9_]*)', r'enum\s+([A-Z][a-zA-Z0-9_]*)'],
    'javascript': [r'class\s+([A-Z][a-zA-Z0-9_]*)', r'interface\s+([A-Z][a-zA-Z0-9_]*)'],
    'typescript': [r'class\s+([A-Z][a-zA-Z0-9_]*)', r'interface\s+([A-Z][a-zA-Z0-9_]*)', r'type\s+([A-Z][a-zA-Z0-9_]*)']
}

def scan_identifiers(root_dir: str):
    terms = set()
    
    for root, _, files in os.walk(root_dir):
        for file in files:
            ext = os.path.splitext(file)[1]
            lang = None
            if ext == '.py': lang = 'python'
            elif ext == '.rs': lang = 'rust'
            elif ext in ['.js', '.jsx']: lang = 'javascript'
            elif ext in ['.ts', '.tsx']: lang = 'typescript'
            
            if lang:
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    for pat in PATTERNS[lang]:
                        matches = re.finditer(pat, content)
                        for m in matches:
                            terms.add(m.group(1))
                except Exception:
                    pass
                    
    return sorted(list(terms))

def main():
    parser = argparse.ArgumentParser(description="Generate Glossary Context")
    parser.add_argument("--path", required=True, help="Repo path")
    parser.add_argument("--output", "-o", help="Output JSON file for LLM")
    
    args = parser.parse_args()
    
    print(f"Scanning for domain terms in {args.path}...")
    terms = scan_identifiers(args.path)
    
    result = {
        "candidate_terms": terms,
        "instruction": "The above terms were extracted from the codebase. Please filter out technical terms (like 'Config', 'Factory') and keep only Domain Terms."
    }
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Context saved to {args.output}")
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
