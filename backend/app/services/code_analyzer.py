import ast
import re
from typing import Dict, Any, List

class CodeAnalyzerService:
    """
    Static Python Code Analyzer Service using Python's native AST parser.
    Implements Three-Layer Validation:
    - Layer 1: PEP 257 Docstring Compliance
    - Layer 2: Parameter Signature Mismatch Detection
    - Layer 3: AST Safety Net Validation
    """

    @staticmethod
    def analyze_code(code: str, filename: str = "main.py") -> Dict[str, Any]:
        lines = code.splitlines()
        total_lines = len(lines)

        try:
            tree = ast.parse(code)
            ast_valid = True
        except SyntaxError as e:
            return {
                "filename": filename,
                "total_lines": total_lines,
                "total_functions": 0,
                "total_classes": 0,
                "docstring_coverage": 0.0,
                "pep257_violations": [{
                    "line": e.lineno or 1,
                    "message": f"SyntaxError: {e.msg}"
                }],
                "param_mismatches": [],
                "ast_valid": False,
                "ast_tree_summary": []
            }

        functions = []
        classes = []
        pep257_violations = []
        param_mismatches = []
        ast_tree_summary = []

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append(node)
                has_doc = ast.get_docstring(node) is not None
                ast_tree_summary.append({
                    "type": "class",
                    "name": node.name,
                    "line": node.lineno,
                    "has_docstring": has_doc
                })
                if not has_doc:
                    pep257_violations.append({
                        "line": node.lineno,
                        "type": "D101",
                        "message": f"Missing docstring in public class '{node.name}'"
                    })

            elif isinstance(node, ast.FunctionDef):
                functions.append(node)
                doc = ast.get_docstring(node)
                has_doc = doc is not None

                # Extract AST parameters (excluding 'self', 'cls')
                args = [arg.arg for arg in node.args.args if arg.arg not in ("self", "cls")]

                ast_tree_summary.append({
                    "type": "function",
                    "name": node.name,
                    "line": node.lineno,
                    "params": args,
                    "has_docstring": has_doc
                })

                # Layer 1: PEP 257 check
                if not has_doc:
                    pep257_violations.append({
                        "line": node.lineno,
                        "type": "D103",
                        "message": f"Missing docstring in public function '{node.name}'"
                    })
                else:
                    # Check first line summary convention
                    doc_lines = doc.strip().splitlines()
                    if doc_lines and not doc_lines[0].endswith("."):
                        pep257_violations.append({
                            "line": node.lineno,
                            "type": "D400",
                            "message": f"First line of docstring in '{node.name}' should end with a period."
                        })

                    # Layer 2: Parameter signature matching
                    param_mismatches.extend(CodeAnalyzerService._check_param_mismatch(node.name, node.lineno, args, doc))

        total_defs = len(functions) + len(classes)
        doc_defs = sum(1 for item in ast_tree_summary if item["has_docstring"])
        docstring_coverage = round((doc_defs / total_defs * 100), 1) if total_defs > 0 else 100.0

        return {
            "filename": filename,
            "total_lines": total_lines,
            "total_functions": len(functions),
            "total_classes": len(classes),
            "docstring_coverage": docstring_coverage,
            "pep257_violations": pep257_violations,
            "param_mismatches": param_mismatches,
            "ast_valid": ast_valid,
            "ast_tree_summary": ast_tree_summary
        }

    @staticmethod
    def _check_param_mismatch(func_name: str, lineno: int, args: List[str], docstring: str) -> List[Dict[str, Any]]:
        """Cross-checks AST parameters against docstring param annotations."""
        mismatches = []
        if not docstring or not args:
            return mismatches

        # Regex search for parameters in Google/NumPy/reST docstrings
        # Matches: Args: param_name (type), :param param_name:, @param param_name
        doc_params = set()

        # Google style (Args:\n  param_name (type): description)
        google_matches = re.findall(r"^\s*([a-zA-Z_]\w*)\s*(?:\([^\)]+\))?:", docstring, re.MULTILINE)
        doc_params.update(google_matches)

        # reST style (:param param_name: description)
        rest_matches = re.findall(r":param\s+([a-zA-Z_]\w*):", docstring)
        doc_params.update(rest_matches)

        # @param style
        at_matches = re.findall(r"@param\s+([a-zA-Z_]\w*)", docstring)
        doc_params.update(at_matches)

        if doc_params:
            for arg in args:
                if arg not in doc_params:
                    mismatches.append({
                        "line": lineno,
                        "function": func_name,
                        "parameter": arg,
                        "message": f"Parameter '{arg}' is present in function definition but missing from docstring documentation."
                    })

        return mismatches

    @staticmethod
    def validate_ast_syntax(code: str) -> bool:
        """Layer 3 Safety Net: Ensures code compiles clean without SyntaxError."""
        try:
            ast.parse(code)
            return True
        except Exception:
            return False


code_analyzer_service = CodeAnalyzerService()
