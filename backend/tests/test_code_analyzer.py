import pytest
from backend.app.services.code_analyzer import CodeAnalyzerService

SAMPLE_CODE = """
class DataProcessor:
    def process_data(self, dataset, batch_size):
        \"\"\"Processes raw dataset in batches.

        Args:
            ds: Raw input list
        \"\"\"
        return dataset[:batch_size]

def calculate_sum(a, b):
    return a + b
"""

def test_ast_analysis_basic():
    result = CodeAnalyzerService.analyze_code(SAMPLE_CODE, "sample.py")
    assert result["ast_valid"] is True
    assert result["total_functions"] == 2
    assert result["total_classes"] == 1
    assert result["total_lines"] > 0
    # calculate_sum missing docstring -> D103
    assert any(v["type"] == "D103" for v in result["pep257_violations"])
    # dataset missing in docstring -> param mismatch
    assert len(result["param_mismatches"]) > 0

def test_ast_safety_validation():
    valid_code = "def foo(): pass"
    invalid_code = "def foo(: pass"
    assert CodeAnalyzerService.validate_ast_syntax(valid_code) is True
    assert CodeAnalyzerService.validate_ast_syntax(invalid_code) is False
