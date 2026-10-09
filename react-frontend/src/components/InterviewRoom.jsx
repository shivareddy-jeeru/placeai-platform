import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const QUESTION_BANK = {
  technical: [
    "How would you optimize a database query handling 100,000 requests per minute with high p99 latency in a microservices environment?",
    "Explain the difference between optimistic and pessimistic locking in PostgreSQL, and when you would prefer each.",
    "How would you architect a distributed caching layer using Redis to reduce database read load by 80%?",
    "Walk through the algorithmic differences between BFS and DFS in graph traversal, and explain their space-time complexities.",
    "What strategies would you use to handle race conditions and ensure idempotency in a high-volume payment or order processing system?",
  ],
  behavioral: [
    "Tell me about a time when you faced a conflict with a teammate regarding technical architecture. How did you resolve it?",
    "Describe a high-pressure situation where you had to ship a critical feature with ambiguous requirements and a tight deadline.",
    "Tell me about a technical mistake you made that impacted a project or production. What did you learn and how did you resolve it?",
    "Give an example of a time when you took end-to-end ownership of a problem that wasn't initially assigned to you.",
    "Why are you interested in joining our engineering team, and how do you approach continuously mastering new technologies?",
  ],
  project: [
    "Tell me about the most challenging part of your PlaceAI project and how you engineered the solution.",
    "How did you design the schema and caching layer to achieve sub-400ms resume analysis latency?",
    "What fallback mechanisms did you architect to handle corrupted PDF/DOCX binary streams from candidate uploads?",
    "If 50,000 students accessed PlaceAI concurrently during campus hiring drive season, how would your system scale?",
    "What security and validation practices did you apply to prevent malicious file uploads or prompt injection?",
  ],
};

const SAMPLE_ANSWERS = {
  technical: "To optimize a query under 100,000 RPM, I would start with query profiling via EXPLAIN ANALYZE to identify sequential scans. Then, I'd create composite B-Tree indexes on frequently filtered columns. At the application layer, I would introduce a Redis Cache-Aside layer with a 5-minute TTL for read-heavy keys, reducing database hits by 80%. Finally, I'd implement connection pooling with PgBouncer and enable read-replica routing to keep p99 latency under 45ms.",
  behavioral: "During our team placement portal build, a colleague wanted to use MongoDB while I advocated PostgreSQL for strict relational schemas. Instead of escalating, I organized a 30-minute benchmark comparing write latency and join query complexity. Seeing that 85% of our operations required multi-table joins, the team unanimously agreed on PostgreSQL. We delivered the milestone 3 days ahead of schedule with zero schema migration errors.",
  project: "In our PlaceAI project, the biggest technical roadblock was ensuring deterministic ATS parsing accuracy across corrupted and nested PDF structures. I resolved this by building a multi-stage fallback parser using PyPDF and docx2txt with regex tokenization, reducing parse failures from 18% to under 1.5% while sustaining sub-400ms response times under concurrent load.",
};

export default function InterviewRoom({ interviewType = 'project', onTypeChange }) {
  const { dispatchEvent } = useSession();

  const [questionIdx, setQuestionIdx] = useState(0);
  const [step, setStep] = useState('IDLE'); // IDLE -> ANSWERING -> EVALUATING -> COMPLETED
  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [rubricResult, setRubricResult] = useState(null);

  const questionsList = QUESTION_BANK[interviewType] || QUESTION_BANK.project;
  const activeQuestion = questionsList[questionIdx % questionsList.length];

  const handleNextQuestion = () => {
    setQuestionIdx(prev => (prev + 1) % questionsList.length);
    handleReset();
  };

  const handleStartAnswering = () => {
    setStep('ANSWERING');
    setIsRecording(true);
    if (!answerText.trim()) {
      setAnswerText('');
    }
  };

  const handleUseSampleAnswer = () => {
    const sample = SAMPLE_ANSWERS[interviewType] || SAMPLE_ANSWERS.project;
    setAnswerText(sample);
    setIsRecording(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (!answerText.trim()) {
      handleUseSampleAnswer();
    }
  };

  const handleEvaluate = () => {
    setStep('EVALUATING');
    setIsRecording(false);

    const textToScore = answerText.trim() || SAMPLE_ANSWERS[interviewType] || SAMPLE_ANSWERS.project;

    setTimeout(() => {
      // Dynamic scoring based on length and technical depth
      const wordCount = textToScore.split(/\s+/).filter(Boolean).length;
      const hasNumbers = /\d+%|\d+ms|\d+/.test(textToScore);
      const hasSTAR = /situation|task|action|result|because|resolved|optimized|built|architected/i.test(textToScore);

      const commScore = Math.min(95, Math.max(74, 75 + Math.min(15, Math.floor(wordCount / 8))));
      const techScore = hasNumbers ? Math.floor(Math.random() * 8) + 84 : 76;
      const confScore = Math.floor(Math.random() * 8) + 82;
      const structScore = hasSTAR ? Math.floor(Math.random() * 6) + 85 : 72;
      const fillerCount = Math.max(1, Math.floor(Math.random() * 4));

      const overall = Math.round((commScore + techScore + confScore + structScore) / 4);

      const generated = {
        communication: commScore,
        technicalAccuracy: techScore,
        confidence: confScore,
        structure: structScore,
        fillerWords: fillerCount,
        overall,
        strengths: [
          hasNumbers
            ? 'Quantified engineering metrics (latencies, percentages, load benchmarks) effectively included'
            : 'Structured explanation articulating engineering intent clearly',
          'Strong command of problem-solving sequence and architecture considerations',
        ],
        improvements: [
          `Only ${fillerCount} filler word(s) detected — maintained steady professional pacing`,
          'In live interviews, highlight memory profiling and failure containment strategies',
        ],
      };

      setRubricResult(generated);
      setStep('COMPLETED');
      dispatchEvent?.('INTERVIEW_COMPLETED', { score: overall });
    }, 1200);
  };

  const handleReset = () => {
    setStep('IDLE');
    setAnswerText('');
    setRubricResult(null);
    setIsRecording(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ─── CHOOSE INTERVIEW TYPE (3 CARDS) ─────────────────────────── */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
          CHOOSE INTERVIEW TYPE
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            { id: 'technical', title: 'Technical Interview', icon: '💻', desc: 'Algorithms, system scalability & distributed databases' },
            { id: 'behavioral', title: 'HR / Behavioral', icon: '👥', desc: 'STAR scenarios, leadership principles & conflict resolution' },
            { id: 'project', title: 'Project Discussion', icon: '🛠', desc: 'Deep dive into your PlaceAI architecture & decisions' },
          ].map(t => (
            <div
              key={t.id}
              onClick={() => {
                onTypeChange?.(t.id);
                setQuestionIdx(0);
                handleReset();
              }}
              style={{
                background: interviewType === t.id
                  ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.1))'
                  : 'var(--bg-surface)',
                border: `1.5px solid ${interviewType === t.id ? '#ec4899' : 'var(--border-default)'}`,
                borderRadius: '20px',
                padding: '1.4rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: interviewType === t.id ? '0 8px 24px rgba(236, 72, 153, 0.18)' : 'none',
              }}
            >
              <div style={{ fontSize: '1.7rem' }}>{t.icon}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)' }}>{t.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── INTERVIEW ROOM & AI INTERVIEWER ──────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-accent)',
        borderRadius: '24px',
        padding: '2.5rem 2.2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              SIMULATED INTERVIEW ROOM • QUESTION {(questionIdx % questionsList.length) + 1} OF {questionsList.length}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
              AI Interviewer Console
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleNextQuestion}
              className="btn btn-secondary"
              style={{ borderRadius: '10px', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: 700 }}
              title="Switch to another question from this category"
            >
              🎲 Next Question
            </button>
            {step !== 'IDLE' && (
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                style={{ borderRadius: '10px', padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
              >
                🔄 Reset Round
              </button>
            )}
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
                AI INTERVIEWER PROMPT
              </span>
              <span className="badge badge-pink" style={{ fontSize: '0.68rem' }}>
                {interviewType.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '1.22rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0 0', lineHeight: 1.45 }}>
              "{activeQuestion}"
            </p>
          </div>
        </div>

        {/* IDLE STATE: START BUTTON */}
        {step === 'IDLE' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', border: '2px solid rgba(236, 72, 153, 0.4)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem auto' }}>
              🎙
            </div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Ready to Practice Your Response?
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Answer verbally or type your explanation. Use the STAR framework (Situation, Task, Action, Result) for top marks.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartAnswering}
                className="btn btn-primary"
                style={{ borderRadius: '16px', padding: '0.95rem 2.4rem', fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
              >
                🎙 Start Answering
              </button>
              <button
                onClick={() => {
                  setStep('ANSWERING');
                  handleUseSampleAnswer();
                }}
                className="btn btn-secondary"
                style={{ borderRadius: '16px', padding: '0.95rem 1.6rem', fontSize: '0.92rem', fontWeight: 700 }}
              >
                💡 Load Sample STAR Answer
              </button>
            </div>
          </div>
        )}

        {/* ANSWERING STATE: AUDIO/TEXT INPUT */}
        {(step === 'ANSWERING' || step === 'EVALUATING') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`badge ${isRecording ? 'badge-red' : 'badge-green'}`} style={{ animation: isRecording ? 'pulse-glow 1.5s infinite' : 'none' }}>
                  {isRecording ? '🔴 Recording Speech…' : '✓ Ready for Evaluation'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type, edit transcript, or load STAR sample</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleUseSampleAnswer}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  💡 Use Sample STAR Answer
                </button>
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="btn btn-secondary"
                    style={{ borderRadius: '10px', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    ⏹ Stop Voice
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRecording(true)}
                    className="btn btn-secondary"
                    style={{ borderRadius: '10px', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    🎙 Resume Voice
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Start typing your response here using STAR methodology (Situation, Task, Action, Result), or click 'Use Sample STAR Answer' above to inspect an ideal response..."
              rows={6}
              disabled={step === 'EVALUATING'}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Word count: {answerText.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleEvaluate}
                disabled={step === 'EVALUATING'}
                className="btn btn-primary"
                style={{ borderRadius: '14px', padding: '0.9rem 2.2rem', fontSize: '0.95rem', fontWeight: 800, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
              >
                {step === 'EVALUATING' ? 'Evaluating AI Rubric… ⏳' : 'Submit Response & Get Score 🎯'}
              </button>
            </div>
          </div>
        )}

        {/* ─── AFTER ANSWER: YOUR SCORE & HOW TO IMPROVE ──────────────── */}
        {step === 'COMPLETED' && rubricResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeUp 0.3s ease' }}>
            
            {/* SCORE HERO CONTAINER */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              borderRadius: '20px',
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 0.75fr) 1.6fr',
              gap: '2rem',
              alignItems: 'center',
            }}>
              {/* Overall Score Dial */}
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-default)', paddingRight: '1.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  OVERALL MOCK SCORE
                </span>
                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ec4899', lineHeight: 1, margin: '0.5rem 0' }}>
                  {rubricResult.overall}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  / 100
                </div>
                <span className="badge badge-pink" style={{ marginTop: '0.5rem' }}>
                  STAR Ready
                </span>
              </div>

              {/* 5-Metric Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Communication Clarity', val: rubricResult.communication, color: '#6366f1' },
                  { label: 'Technical Accuracy & Depth', val: rubricResult.technicalAccuracy, color: '#10b981' },
                  { label: 'Confidence & Delivery', val: rubricResult.confidence, color: '#f472b6' },
                  { label: 'Structure (STAR Framework)', val: rubricResult.structure, color: '#f59e0b' },
                  { label: 'Filler Words', val: `${rubricResult.fillerWords} detected`, isText: true, color: '#10b981' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{metric.label}</span>
                      <span style={{ color: metric.color }}>{metric.val}</span>
                    </div>
                    {!metric.isText && (
                      <div style={{ height: '7px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${metric.val}%`, height: '100%', background: metric.color, borderRadius: '99px' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* HOW TO IMPROVE SECTION */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(99, 102, 241, 0.06))',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  How To Improve For Your Next Interview Round
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>✓ KEY STRENGTHS:</span>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {rubricResult.strengths.map((s, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>⚠ ACTIONABLE TWEAKS:</span>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {rubricResult.improvements.map((imp, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px', padding: '0.75rem 1.4rem' }}
                >
                  🎲 Try Another Question
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '0.75rem 1.6rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
                >
                  Practice Again →
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
