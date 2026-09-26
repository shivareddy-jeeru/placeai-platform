import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DEFAULT_SAMPLE_CODE = `class Calculator:
    """Simple arithmetic calculator."""

    def add(self, a, b):
        return a + b

    def divide(self, numerator, denominator):
        """Divides two numbers without handling zero division.
        
        Args:
            num: First number
        """
        return numerator / denominator

def calculate_fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
`;

export default function CodeReviewer() {
  const [code, setCode] = useState(DEFAULT_SAMPLE_CODE);
  const [style, setStyle] = useState('google');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit', 'refactored', 'pytest', 'ast'
  
  const [analysis, setAnalysis] = useState(null);
  const [refactorResult, setRefactorResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto-analyze initial code on mount
  useEffect(() => {
    handleAnalyze(DEFAULT_SAMPLE_CODE);
  }, []);

  const handleAnalyze = async (targetCode = code) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeCode(targetCode);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze Python code AST.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefactor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.refactorDocstrings(code, style);
      setRefactorResult(res.data);
      setActiveTab('refactored');
      // Re-run analysis on refactored code
      handleAnalyze(res.data.refactored_code);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to refactor code docstrings.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runTests(code);
      setTestResult(res.data);
      setActiveTab('pytest');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to run sandboxed pytest suite.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setCode(text);
        handleAnalyze(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #161925 100%)',
        border: '1px solid #312e81',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
              AI Code Reviewer & AST Sandbox
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            Local Python AST static linting, PEP 257 compliance, parameter signature matching, and sandboxed Pytest execution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{
            background: '#27272a',
            border: '1px solid #3f3f46',
            color: '#e4e4e7',
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}>
            📁 Upload .py File
            <input type="file" accept=".py" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button
            onClick={() => {
              setCode(DEFAULT_SAMPLE_CODE);
              handleAnalyze(DEFAULT_SAMPLE_CODE);
            }}
            style={{
              background: '#312e81',
              border: '1px solid #4338ca',
              color: '#818cf8',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            🔄 Load Sample Code
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Side: Python Editor & Action Bar */}
        <div style={{
          background: '#161925',
          border: '1px solid #2d3342',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#38bdf8' }}>
              💻 Python Source Code
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Docstring Style:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="google">Google Style</option>
                <option value="numpy">NumPy Style</option>
                <option value="rest">reST / Sphinx</option>
              </select>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste or write Python code here..."
            rows={18}
            style={{
              width: '100%',
              background: '#0b0d14',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '1rem',
              color: '#38bdf8',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              resize: 'vertical',
              outline: 'none',
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '⏳ Processing...' : '🔍 Analyze AST'}
            </button>

            <button
              onClick={handleRefactor}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              🧠 Refactor Docstrings
            </button>

            <button
              onClick={handleRunTests}
              disabled={loading}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              🧪 Run Pytest Sandbox
            </button>
          </div>
        </div>

        {/* Right Side: Analysis Dashboard & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Quick Metrics Cards */}
          {analysis && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              
              <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Docstring</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0.25rem 0', color: analysis.docstring_coverage >= 80 ? '#34d399' : '#f59e0b' }}>
                  {analysis.docstring_coverage}%
                </h2>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Coverage Ratio</span>
              </div>

              <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>AST Status</span>
                <div style={{ margin: '0.4rem 0' }}>
                  <span style={{
                    background: analysis.ast_valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: analysis.ast_valid ? '#34d399' : '#f87171',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '800'
                  }}>
                    {analysis.ast_valid ? 'Valid AST' : 'Syntax Error'}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Syntax Check</span>
              </div>

              <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>PEP 257</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0.25rem 0', color: analysis.pep257_violations.length === 0 ? '#34d399' : '#f87171' }}>
                  {analysis.pep257_violations.length}
                </h2>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Violations</span>
              </div>

              <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>Signature</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0.25rem 0', color: analysis.param_mismatches.length === 0 ? '#34d399' : '#fbbf24' }}>
                  {analysis.param_mismatches.length}
                </h2>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Mismatches</span>
              </div>

            </div>
          )}

          {/* Results Tab View */}
          <div style={{
            background: '#161925',
            border: '1px solid #2d3342',
            borderRadius: '16px',
            padding: '1.25rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #2d3342', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setActiveTab('audit')}
                style={{
                  background: activeTab === 'audit' ? '#312e81' : 'transparent',
                  color: activeTab === 'audit' ? '#a5b4fc' : '#94a3b8',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🔍 Validation Audit ({analysis ? analysis.pep257_violations.length + analysis.param_mismatches.length : 0})
              </button>

              <button
                onClick={() => setActiveTab('refactored')}
                style={{
                  background: activeTab === 'refactored' ? '#312e81' : 'transparent',
                  color: activeTab === 'refactored' ? '#a5b4fc' : '#94a3b8',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ✨ Refactored Code
              </button>

              <button
                onClick={() => setActiveTab('pytest')}
                style={{
                  background: activeTab === 'pytest' ? '#312e81' : 'transparent',
                  color: activeTab === 'pytest' ? '#a5b4fc' : '#94a3b8',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🧪 Pytest Sandbox
              </button>

              <button
                onClick={() => setActiveTab('ast')}
                style={{
                  background: activeTab === 'ast' ? '#312e81' : 'transparent',
                  color: activeTab === 'ast' ? '#a5b4fc' : '#94a3b8',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🌳 AST Summary
              </button>
            </div>

            {/* Tab 1: Validation Audit */}
            {activeTab === 'audit' && (
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingRight: '0.5rem' }}>
                {!analysis ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Click "Analyze AST" to run static code checks.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* PEP 257 Violations */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f87171', margin: '0 0 0.5rem 0' }}>
                        PEP 257 Docstring Compliance ({analysis.pep257_violations.length})
                      </h4>
                      {analysis.pep257_violations.length === 0 ? (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                          ✅ All functions and classes meet PEP 257 docstring standards.
                        </div>
                      ) : (
                        analysis.pep257_violations.map((v, i) => (
                          <div key={i} style={{ background: '#0f172a', borderLeft: '3px solid #ef4444', padding: '0.65rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                            <strong style={{ color: '#fca5a5' }}>Line {v.line} ({v.type || 'PEP257'}):</strong> {v.message}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Parameter Mismatches */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fbbf24', margin: '0 0 0.5rem 0' }}>
                        Parameter Signature Mismatches ({analysis.param_mismatches.length})
                      </h4>
                      {analysis.param_mismatches.length === 0 ? (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', color: '#34d399', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                          ✅ All documented parameters perfectly match function definitions.
                        </div>
                      ) : (
                        analysis.param_mismatches.map((m, i) => (
                          <div key={i} style={{ background: '#0f172a', borderLeft: '3px solid #f59e0b', padding: '0.65rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                            <strong style={{ color: '#fcd34d' }}>Function `{m.function}` (Line {m.line}):</strong> {m.message}
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Refactored Code */}
            {activeTab === 'refactored' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!refactorResult ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Click "Refactor Docstrings" to generate AI enhanced code.</p>
                ) : (
                  <>
                    <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#c7d2fe' }}>
                      ✨ {refactorResult.changes_summary.join(' ')}
                    </div>
                    <pre style={{
                      background: '#0b0d14',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '1rem',
                      color: '#a7f3d0',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                      overflowX: 'auto',
                      maxHeight: '340px'
                    }}>
                      {refactorResult.refactored_code}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Tab 3: Pytest Execution Log */}
            {activeTab === 'pytest' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!testResult ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Click "Run Pytest Sandbox" to synthesize and execute tests.</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <span style={{ background: testResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: testResult.success ? '#34d399' : '#f87171', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800' }}>
                        {testResult.success ? 'PASSED' : 'FAILED'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tests Passed: <strong>{testResult.passed_tests} / {testResult.total_tests}</strong></span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Time: <strong>{testResult.execution_time_seconds}s</strong></span>
                    </div>

                    <pre style={{
                      background: '#020617',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      padding: '1rem',
                      color: '#38bdf8',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.8rem',
                      overflowX: 'auto',
                      maxHeight: '340px'
                    }}>
                      {testResult.output_log}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Tab 4: AST Summary */}
            {activeTab === 'ast' && (
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px' }}>
                {!analysis ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No AST data available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {analysis.ast_tree_summary.map((item, idx) => (
                      <div key={idx} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '0.65rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', background: item.type === 'class' ? '#4338ca' : '#0284c7', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', marginRight: '0.5rem', fontWeight: '800' }}>
                            {item.type}
                          </span>
                          <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{item.name}</strong>
                          {item.params && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>({item.params.join(', ')})</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: item.has_docstring ? '#34d399' : '#f87171', fontWeight: '700' }}>
                          {item.has_docstring ? '📄 Has Docstring' : '⚠️ Missing Docstring'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
