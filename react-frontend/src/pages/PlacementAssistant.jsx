import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useSession } from '../context/SessionContext';

const PlacementAssistant = () => {
  const { session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const sessionId = localStorage.getItem('session_id') || 'default';
      const res = await api.getChatHistory(sessionId);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const sessionId = localStorage.getItem('session_id') || 'default';
      const res = await api.sendChatMessage(userMessage.content, sessionId);
      if (res.data && res.data.message) {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Make sure the backend server is active.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="placement-assistant fade-in-up" style={{ padding: '2rem 0', height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">🤖 AI career Mentor</h1>
        <p className="page-subtitle">Interact with PlaceAI Senior Placement Mentor. Get tailored study insights based on your active resume and target role gaps.</p>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', overflow: 'hidden' }}>
        {/* Left Column: Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', padding: '2rem', maxWidth: '400px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤖</div>
                <h3>AI Placement Mentor</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginTop: '0.5rem' }}>
                  Ask questions like "What should I improve first?" or "Explain Docker fundamentals" to get advice tailored to your placement readiness metrics.
                </p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div 
                  key={i} 
                  style={{ 
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: m.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#ffffff',
                    padding: '0.85rem 1.25rem',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <span style={{ display: 'block', fontSize: '0.7rem', color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    {m.role === 'user' ? 'Candidate' : 'AI Career Mentor'}
                  </span>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{m.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              placeholder="Ask the AI Mentor a question..."
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              style={{ borderRadius: '12px', flex: 1 }}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.85rem 2rem', borderRadius: '12px' }}
              disabled={sending || !input.trim()}
            >
              {sending ? 'Typing...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Right Column: Context summary checklist */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'stretch', overflowY: 'auto' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-title)', marginBottom: '0.25rem' }}>📋 Auditor Context</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live session audit variables read by Mentor Agent</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Resume ATS Score</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                {session?.atsScore ? `${session.atsScore}%` : 'Not Uploaded'}
              </strong>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Job Compatibility</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                {session?.jobMatches?.[0] ? `${session.jobMatches[0].match_percentage}%` : 'Not Analyzed'}
              </strong>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Role</span>
              <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                {session?.learningRoadmap?.target_role || 'Not Selected'}
              </strong>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Roadmap State</span>
              <span className={`badge-tag ${session?.learningRoadmap ? 'success' : 'info'}`}>
                {session?.learningRoadmap ? 'Generated' : 'Pending'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Gaps</span>
              {session?.skillGaps && session.skillGaps.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {session.skillGaps.slice(0, 5).map((gap, i) => (
                    <span key={i} className="badge-tag danger" style={{ fontSize: '0.75rem' }}>
                      {gap.skill || gap}
                    </span>
                  ))}
                </div>
              ) : (
                <em style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>None</em>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementAssistant;
