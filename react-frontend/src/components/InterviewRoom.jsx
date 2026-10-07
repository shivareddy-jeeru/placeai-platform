import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

export default function InterviewRoom() {
  const { evaluateInterviewResponse, refreshDashboard, showToast } = useSession();

  const [step, setStep] = useState('IDLE'); // IDLE -> INTERVIEW_STARTED -> EVALUATING -> COMPLETED
  const [topic, setTopic] = useState('Full Stack Web Architecture & APIs');
  const [answer, setAnswer] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const question = "Describe a time when you had to optimize a slow web application or database query under production constraints. What steps did you take and what were the measurable results?";

  const handleStart = () => {
    setStep('INTERVIEW_STARTED');
    setAnswer('');
    setEvalResult(null);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      showToast('Please type your response before submitting.', 'error');
      return;
    }

    setLoading(true);
    setStep('EVALUATING');

    try {
      const qnaRecords = [{
        question,
        answer: answer.trim()
      }];

      const res = await evaluateInterviewResponse(topic, qnaRecords);
      setEvalResult(res);
      setStep('COMPLETED');
      await refreshDashboard();
    } catch (err) {
      console.error(err);
      showToast('Failed to evaluate answer with backend rubric. Please try again.', 'error');
      setStep('INTERVIEW_STARTED');
    } finally {
      setLoading(false);
    }
  };

  const rubric = evalResult?.rubric_scores || {
    technical_accuracy: 75,
    problem_solving: 78,
    star_structure: 70,
    communication: 80,
    relevance: 85,
    conciseness: 75
  };

  return (
    <div style={{ background: '#111625', border: '1px solid #28334e', borderRadius: '24px', padding: '2rem', color: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            BACKEND STAR EVALUATION ENGINE
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '2px 0 0 0' }}>
            AI Mock Interview Coach 🎤
          </h3>
        </div>
        {step !== 'IDLE' && (
          <button
            onClick={handleStart}
            style={{
              background: '#161d2d',
              border: '1px solid #28334e',
              color: '#cbd5e1',
              borderRadius: '10px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            🔄 New Practice Round
          </button>
        )}
      </div>

      {step === 'IDLE' && (
        <div style={{
          background: '#090b10',
          border: '1px solid #1e2638',
          borderRadius: '20px',
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#ec4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🎤
          </div>
          <div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: '900', margin: '0 0 0.5rem 0' }}>
              STAR Technical Scenario Practice
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
              Answer real-world STAR scenario questions. Evaluated deterministically against our 6-category backend rubric: Technical Accuracy 30%, Problem Solving 25%, STAR Structure 15%, Communication 15%, Relevance 10%, Conciseness 5%.
            </p>
          </div>
          <button
            onClick={handleStart}
            style={{
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem 2.2rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)'
            }}
          >
            Start Practice Question →
          </button>
        </div>
      )}

      {step === 'INTERVIEW_STARTED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#090b10', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '18px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase' }}>
                INTERVIEW PROMPT
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                Target: {topic}
              </span>
            </div>
            <p style={{ fontSize: '1.08rem', color: '#ffffff', fontWeight: '700', margin: 0, lineHeight: 1.45 }}>
              "{question}"
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800' }}>
                YOUR RESPONSE (USE STAR: SITUATION, TASK, ACTION, RESULT):
              </label>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Situation: In my previous project, our PostgreSQL database query took 1.2s due to missing foreign key indexes...&#10;Task: I had to reduce response time below 200ms...&#10;Action: I analyzed the slow query log, added compound indexes, and set up Redis caching...&#10;Result: Latency dropped by 70% to 150ms for 5,000 concurrent users."
              rows={7}
              style={{
                width: '100%',
                background: '#090b10',
                border: '1px solid #28334e',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setStep('IDLE')}
              style={{
                background: '#161d2d',
                border: '1px solid #28334e',
                color: '#94a3b8',
                borderRadius: '12px',
                padding: '0.8rem 1.4rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem 2rem',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
              }}
            >
              Submit for Rubric Evaluation →
            </button>
          </div>
        </div>
      )}

      {step === 'EVALUATING' && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: '#ec4899' }} />
          <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
            Analyzing response against documented 6-factor rubric…
          </h4>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Scoring Technical Accuracy, Problem Solving, STAR Structure, and Communication
          </span>
        </div>
      )}

      {step === 'COMPLETED' && evalResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeInUp 0.3s ease' }}>
          
          {/* Header Score Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase' }}>
                OVERALL RUBRIC SCORE
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff', margin: '0.2rem 0' }}>
                {evalResult.overall_score}/10
              </div>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Recorded to your placement readiness index in backend.
              </span>
            </div>

            <button
              onClick={handleStart}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '0.7rem 1.4rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Practice Another Prompt →
            </button>
          </div>

          {/* 6 Rubric Component Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Technical Accuracy (30%)', val: rubric.technical_accuracy, color: '#38bdf8' },
              { label: 'Problem Solving (25%)', val: rubric.problem_solving, color: '#818cf8' },
              { label: 'STAR Structure (15%)', val: rubric.star_structure, color: '#ec4899' },
              { label: 'Communication (15%)', val: rubric.communication, color: '#34d399' },
              { label: 'Relevance (10%)', val: rubric.relevance, color: '#f59e0b' },
              { label: 'Conciseness (5%)', val: rubric.conciseness, color: '#c084fc' }
            ].map(item => (
              <div key={item.label} style={{ background: '#090b10', border: '1px solid #1e2638', padding: '1rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>
                  {item.label}
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: item.color }}>
                  {item.val}%
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#090b10', border: '1px solid #1e2638', borderRadius: '18px', padding: '1.5rem' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#34d399', margin: '0 0 0.75rem 0' }}>
                ✅ Key Strengths
              </h5>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {(evalResult.detailed_feedback?.strengths || ['Demonstrated problem solving mindset.']).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#090b10', border: '1px solid #1e2638', borderRadius: '18px', padding: '1.5rem' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f59e0b', margin: '0 0 0.75rem 0' }}>
                💡 Actionable Improvements
              </h5>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {(evalResult.detailed_feedback?.weaknesses || ['Continue practicing STAR result quantification.']).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improved Model Answer */}
          {evalResult.detailed_feedback?.improved_answer && (
            <div style={{ background: '#090b10', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '18px', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase' }}>
                EXEMPLAR STAR MODEL ANSWER
              </span>
              <p style={{ margin: '0.5rem 0 0 0', color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {evalResult.detailed_feedback.improved_answer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
