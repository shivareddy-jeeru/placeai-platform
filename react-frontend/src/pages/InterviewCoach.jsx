import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import api from '../utils/api';

const InterviewCoach = () => {
  const { session, setSession, showToast } = useSession();
  
  // Wizard setup states
  const [role, setRole] = useState('Backend Developer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(3);

  // Interactive flow states
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [qnaRecords, setQnaRecords] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  if (!session) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 className="page-title">🎤 AI Interview Coach</h1>
          <p className="page-subtitle">Simulate mock technical/HR interviews, record responses, and view STAR-framework feedback.</p>
        </header>
        
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{ fontSize: '4rem' }}>🎤</div>
          <h2>No Resume Uploaded</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Upload your resume in the Resume Analyzer module first to populate custom interview questions.
          </p>
        </div>
      </div>
    );
  }

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setQuestions([]);
    setFinalReport(null);
    setCurrentIndex(0);
    setStudentAnswer('');
    setQnaRecords([]);

    try {
      const activeJobId = session.jobMatches?.[0]?.job_id || null;
      const res = await api.startInterview(role, difficulty, activeJobId, numQuestions);
      if (res.data && res.data.questions) {
        setQuestions(res.data.questions);
      } else {
        showToast('Failed to generate questions.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating interview questions.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!studentAnswer.trim()) return;

    // Save answer to records list
    const currentQObj = questions[currentIndex];
    const newRecord = {
      question: currentQObj.question,
      answer: studentAnswer
    };
    
    setQnaRecords(prev => [...prev, newRecord]);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStudentAnswer('');
    } else {
      // Evaluate everything
      handleSubmitInterview([...qnaRecords, newRecord]);
    }
  };

  const handleSubmitInterview = async (finalQnas) => {
    setEvaluating(true);
    try {
      const res = await api.evaluateInterview(role, finalQnas);
      setFinalReport(res.data);
      
      // Update session status in frontend context
      setSession(prev => ({
        ...prev,
        interviewResults: res.data,
        timeline: [...prev.timeline, { time: 'Just now', event: `Mock Interview Completed - Score ${res.data.overall_score}/10` }]
      }));
      showToast('Interview evaluation completed!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error evaluating interview answers.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8.0) return '#10b981';
    if (score >= 6.5) return '#3b82f6';
    if (score >= 5.0) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="interview-coach fade-in-up" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">🎤 AI Interview Coach</h1>
        <p className="page-subtitle">Simulate mock technical/HR interviews, record responses, and view STAR-framework feedback.</p>
      </header>

      {/* Setup Wizard */}
      {questions.length === 0 && !generating && !finalReport && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Configure Your Session</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Choose Topic Track</span>
              <input
                type="text"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Python Backend Developer, React Frontend Developer..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Difficulty Level</span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="form-control">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Number of Questions</span>
                <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="form-control">
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleGenerateQuestions} style={{ padding: '0.75rem', marginTop: '1rem' }}>
              ⚙️ Generate Interview Questions
            </button>
          </div>
        </div>
      )}

      {/* Loading question set */}
      {generating && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)', width: '3rem', height: '3rem', margin: '0 auto 1.5rem' }}></div>
          <h3>Simulating interview pipeline...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing target role requirements and formatting mock questions...</p>
        </div>
      )}

      {/* Dynamic Q&A Flow */}
      {questions.length > 0 && !finalReport && (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>QUESTION {currentIndex + 1} OF {questions.length}</span>
            <span className="badge-tag info">{role} • {difficulty}</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            {questions[currentIndex].question}
          </h3>

          <textarea 
            rows="6"
            className="form-control"
            placeholder="Type your structured answer here (utilize STAR format for behavioral questions)..."
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            style={{ resize: 'none', marginBottom: '1.5rem' }}
            disabled={evaluating}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => alert("Speak your answer clearly. Transcription model will listen (Simulated).")} disabled={evaluating}>
              🎙️ Record Answer (Voice)
            </button>

            <button className="btn btn-primary" onClick={handleNextQuestion} disabled={evaluating || !studentAnswer.trim()} style={{ padding: '0.75rem 2rem' }}>
              {evaluating ? 'Evaluating...' : currentIndex < questions.length - 1 ? 'Next Question ➔' : 'Submit Mock Interview ➔'}
            </button>
          </div>
        </div>
      )}

      {/* Evaluating screen */}
      {evaluating && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)', width: '3rem', height: '3rem', margin: '0 auto 1.5rem' }}></div>
          <h3>Generating AI evaluation summary...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Assessing technical accuracy, communication clarity, and STAR response layout...</p>
        </div>
      )}

      {/* Final Interview Score Report */}
      {finalReport && !evaluating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Session Overview</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>{finalReport.topic} Mock Interview</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall Score</span>
                <strong style={{ fontSize: '1.8rem', color: getScoreColor(finalReport.overall_score) }}>
                  {finalReport.overall_score}/10
                </strong>
              </div>
              <button className="btn btn-primary" onClick={() => setFinalReport(null)}>
                🔄 Start New Mock
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left: Score breakdown */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>🤖 Score Breakdown</h3>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Technical accuracy</span>
                  <strong>{finalReport.technical_score * 10}%</strong>
                </div>
                <div className="bar-container" style={{ margin: 0 }}>
                  <div className="bar-value" style={{ width: `${finalReport.technical_score * 10}%`, backgroundColor: '#10b981' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Communication & Grammar</span>
                  <strong>{finalReport.grammar_score * 10}%</strong>
                </div>
                <div className="bar-container" style={{ margin: 0 }}>
                  <div className="bar-value" style={{ width: `${finalReport.grammar_score * 10}%`, backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>STAR Confidence</span>
                  <strong>{finalReport.confidence_score * 10}%</strong>
                </div>
                <div className="bar-container" style={{ margin: 0 }}>
                  <div className="bar-value" style={{ width: `${finalReport.confidence_score * 10}%`, backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
            </div>

            {/* Right: Feedback */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>📝 Advisor Guidance</h3>
              <div>
                <strong style={{ color: '#10b981', display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>🟢 Core Strengths</strong>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {finalReport.detailed_feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>🔴 Key Weaknesses</strong>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {finalReport.detailed_feedback?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* QNA details */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>💬 Answer Reviews & Improvements</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {finalReport.qna_records?.map((rec, idx) => (
                <div key={idx} style={{ borderBottom: idx < finalReport.qna_records.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-title)', marginBottom: '0.5rem' }}>Q{idx + 1}: {rec.question}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', margin: '0.75rem 0' }}>
                    <strong>Your Answer:</strong> {rec.answer}
                  </div>
                  {rec.improved_answer && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', background: 'rgba(59, 130, 246, 0.03)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                      <strong>AI Improved Formulation:</strong> {rec.improved_answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewCoach;
