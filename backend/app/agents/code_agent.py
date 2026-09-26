import os
import time
import tempfile
import subprocess
import logging
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.services.code_analyzer import CodeAnalyzerService
from backend.app.config import settings

logger = logging.getLogger(__name__)

class CodeAgent(BaseAgent):
    """
    Agent responsible for AI-powered Code Review, Docstring Synthesis/Refactoring,
    Pytest Generation, and Sandboxed Test Execution.
    """

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Abstract method implementation from BaseAgent."""
        action = inputs.get("action", "analyze")
        code = inputs.get("code", "")
        
        if action == "refactor":
            style = inputs.get("style", "google")
            return self.refactor_docstrings(code, style)
        elif action == "generate_tests":
            return self.generate_pytest(code)
        elif action == "run_tests":
            test_code = inputs.get("test_code")
            return self.run_pytest_sandbox(code, test_code)
        else:
            return CodeAnalyzerService.analyze_code(code)

    def _call_llm(self, prompt: str) -> str:
        """Invokes LLM (LangChain or direct HTTP Gemini API) with fallback."""
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Returning template response.")
            return "```python\n# Refactored Code (Mock Mode)\n" + prompt.split("Code to Refactor:\n```python\n")[-1]

        try:
            if self.llm:
                res = self.llm.invoke(prompt)
                return res.content
            else:
                return self.call_gemini_http(
                    system_instruction="You are an expert Python Code Refactoring & QA Assistant.",
                    human_message=prompt
                )
        except Exception as e:
            logger.error(f"LLM call failed in CodeAgent: {e}")
            return f"```python\n# Error during LLM generation: {e}\n"

    def refactor_docstrings(self, code: str, style: str = "google") -> Dict[str, Any]:
        """
        Generates or converts code docstrings to the specified format (google, numpy, rest).
        Enforces Layer 3 AST Safety Net before returning.
        """
        analysis_before = CodeAnalyzerService.analyze_code(code)

        style_instruction = {
            "google": "Google Style Python Docstrings (Args:, Returns:, Raises:)",
            "numpy": "NumPy Style Python Docstrings (Parameters\n----------, Returns\n-------)",
            "rest": "reST / Sphinx Style Docstrings (:param arg: description, :returns: description)"
        }.get(style.lower(), "Google Style Python Docstrings")

        prompt = f"""
You are an expert Python Code Refactoring & Quality Assistant.
Below is Python code that requires professional docstrings.

Code to Refactor:
```python
{code}
```

Instructions:
1. Add or refactor complete, high-quality docstrings for ALL public classes and functions in {style_instruction}.
2. Ensure every argument, return value, and raised exception is accurately documented.
3. Keep the exact implementation logic unchanged — DO NOT modify code execution logic.
4. Output ONLY the raw refactored Python code inside markdown ```python ... ``` code block without additional text.
"""
        response_text = self._call_llm(prompt)

        # Extract code block from response
        refactored_code = self._clean_code_block(response_text)

        # Layer 3 AST Safety Check
        if not CodeAnalyzerService.validate_ast_syntax(refactored_code):
            logger.warning("Refactored code failed AST validation. Falling back to original code.")
            refactored_code = code

        analysis_after = CodeAnalyzerService.analyze_code(refactored_code)

        changes_summary = []
        if analysis_after["docstring_coverage"] > analysis_before["docstring_coverage"]:
            changes_summary.append(f"Docstring coverage increased from {analysis_before['docstring_coverage']}% to {analysis_after['docstring_coverage']}%.")
        changes_summary.append(f"Applied {style.upper()} docstring convention across {analysis_after['total_functions']} functions.")

        return {
            "refactored_code": refactored_code,
            "style_used": style,
            "docstring_coverage_before": analysis_before["docstring_coverage"],
            "docstring_coverage_after": analysis_after["docstring_coverage"],
            "changes_summary": changes_summary
        }

    def generate_pytest(self, code: str) -> Dict[str, Any]:
        """
        Synthesizes a comprehensive pytest suite for the provided code.
        """
        analysis = CodeAnalyzerService.analyze_code(code)
        functions_to_test = [item["name"] for item in analysis["ast_tree_summary"] if item["type"] == "function"]

        prompt = f"""
You are a Senior Python QA Automation Engineer.
Write a comprehensive pytest unit test suite for the following Python code.

Target Code:
```python
{code}
```

Instructions:
1. Write clean, self-contained `pytest` test functions testing edge cases, valid inputs, and error handling.
2. Include necessary imports (including `pytest`).
3. Return ONLY the complete executable pytest Python code inside ```python ... ``` code blocks.
"""
        response_text = self._call_llm(prompt)
        test_code = self._clean_code_block(response_text)

        return {
            "test_code": test_code,
            "functions_tested": functions_to_test
        }

    def run_pytest_sandbox(self, code: str, test_code: str = None) -> Dict[str, Any]:
        """
        Executes pytest in a sandboxed temporary directory context.
        """
        if not test_code:
            generated = self.generate_pytest(code)
            test_code = generated["test_code"]

        start_time = time.time()

        with tempfile.TemporaryDirectory() as tmpdir:
            source_file = os.path.join(tmpdir, "solution.py")
            test_file = os.path.join(tmpdir, "test_solution.py")

            # Write source code
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(code)

            # Prepend import statement if missing
            if "import solution" not in test_code and "from solution import" not in test_code:
                full_test_code = f"import sys\nsys.path.insert(0, r'{tmpdir}')\nfrom solution import *\n\n" + test_code
            else:
                full_test_code = f"import sys\nsys.path.insert(0, r'{tmpdir}')\n" + test_code

            with open(test_file, "w", encoding="utf-8") as f:
                f.write(full_test_code)

            # Run pytest via subprocess
            try:
                result = subprocess.run(
                    ["pytest", "-v", test_file],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=15
                )
                output = result.stdout + "\n" + result.stderr
                success = result.returncode == 0
            except subprocess.TimeoutExpired:
                output = "Pytest sandbox execution timed out after 15 seconds."
                success = False
            except Exception as e:
                output = f"Sandbox execution error: {str(e)}"
                success = False

        exec_time = round(time.time() - start_time, 2)

        # Parse test outcomes from stdout
        passed = output.count(" PASSED")
        failed = output.count(" FAILED")
        total = passed + failed if (passed + failed) > 0 else (1 if success else 0)

        return {
            "success": success,
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": failed,
            "execution_time_seconds": exec_time,
            "output_log": output.strip()
        }

    def _clean_code_block(self, text: str) -> str:
        """Helper to extract clean code from markdown code blocks."""
        if "```python" in text:
            parts = text.split("```python")
            if len(parts) > 1:
                return parts[1].split("```")[0].strip()
        elif "```" in text:
            parts = text.split("```")
            if len(parts) > 1:
                return parts[1].strip()
        return text.strip()


code_agent = CodeAgent()
