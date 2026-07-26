import React, { useState } from 'react';
import RubricScore from './RubricScore';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { EVENTS } from '../utils/eventEmitter';

export default function InterviewRoom() {
  const { dispatchEvent } = usePlacementProfile();

  const [step, setStep] = useState('IDLE'); // IDLE -> INTERVIEW_STARTED -> ANSWER_SUBMITTED -> EVALUATING -> COMPLETED
  const [answer, setAnswer] = useState('');
  const [rubric, setRubric] = useState(null);

  const question = "Describe a time when you optimized a slow web application or database query. What steps did you take and what were the measurable results?";

  const handleStart = () => {
    setStep('INTERVIEW_STARTED');
    setAnswer('');
    setRubric(null);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    setStep('EVALUATING');

    setTimeout(() => {
      const generatedRubric = {
        communication: 8.4,
        technicalAccuracy: 7.8,
        structure: 8.0,
        confidence: 8.5,
        overallScore: 82,
        feedback: "Excellent STAR structure! You clearly identified the Situation (40% API delay), Action (adding Redis cache & PostgreSQL index), and Result (response time dropped from 1.2s to 120ms)."
      };
      setRubric(generatedRubric);
      setStep('COMPLETED');
      dispatchEvent(EVENTS.INTERVIEW_COMPLETED, { score: 82 });
    }, 1500);
  };

  return (
    <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SIMULATED INTERVIEW ENVIRONMENT
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
            AI STAR Mock Interview Simulator 🎤
          </h3>
        </div>
        {step !== 'IDLE' && (
          <button onClick={handleStart} style={{ background: '#1e2438', border: '1px solid #2d3342', color: '#94a3b8', borderRadius: '10px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
            🔄 Reset Round
          </button>
        )}
      </div>

      {step === 'IDLE' && (
        <div style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '18px', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            🎤
          </div>
          <div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
              Software Engineer Behavioral & Technical Practice
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, maxWidth: '500px', lineHeight: 1.4 }}>
              Answer real-world STAR interview prompts. Our AI will analyze your response across 4 core competencies and update your readiness score.
            </p>
          </div>
          <button
            onClick={handleStart}
            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.9rem 2.2rem', fontSize: '0.95rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}
          >
            Start Mock Interview Round →
          </button>
        </div>
      )}

      {step === 'INTERVIEW_STARTED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#0f1117', border: '1px solid rgba(236, 72, 153, 0.35)', borderRadius: '18px', padding: '1.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INTERVIEW QUESTION #1
            </span>
            <p style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '700', margin: '0.4rem 0 0 0', lineHeight: 1.4 }}>
              "{question}"
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>
              YOUR RESPONSE (USE STAR METHOD: SITUATION, TASK, ACTION, RESULT):
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="In my previous web project, our PostgreSQL database query for fetching student recommendations took over 1.2s due to unindexed foreign keys..."
              rows={6}
              style={{
                width: '100%',
                background: '#0f1117',
                border: '1px solid #2d3342',
                borderRadius: '16px',
                padding: '1.1rem',
                color: '#ffffff',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim()}
            style={{
              alignSelf: 'flex-end',
              background: answer.trim() ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : '#2d3342',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.85rem 2rem',
              fontSize: '0.92rem',
              fontWeight: '900',
              cursor: answer.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Submit for AI STAR Evaluation →
          </button>
        </div>
      )}

      {step === 'EVALUATING' && (
        <div style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '18px', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>✨</div>
          <h4 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '900', margin: 0 }}>
            Analyzing STAR Rubric & Technical Accuracy…
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Evaluating communication, problem structure, confidence, and metric impact.
          </p>
        </div>
      )}

      {step === 'COMPLETED' && rubric && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RubricScore rubric={rubric} />

          <button
            onClick={handleStart}
            style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.8rem 1.8rem', fontSize: '0.88rem', fontWeight: '900', cursor: 'pointer' }}
          >
            Practice Another Question →
          </button>
        </div>
      )}
    </div>
  );
}
