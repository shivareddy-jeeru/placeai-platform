import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const API_BASE = import.meta.env.VITE_API_BASE_URL || (isProd ? '/api' : 'http://localhost:8000/api');

async function apiPost(path, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // full user object from /auth/me
  const [token, setToken] = useState(() => localStorage.getItem('placeai_token'));
  const [loading, setLoading] = useState(true); // true while verifying existing token

  // On mount — verify the saved token is still valid, or create a guest session
  useEffect(() => {
    const verifyOrCreate = async () => {
      let saved = localStorage.getItem('placeai_token');
      let isValid = false;
      
      if (saved) {
        try {
          const me = await apiGet('/auth/me', saved);
          setUser(me);
          setToken(saved);
          isValid = true;
        } catch (err) {
          console.warn("Existing token invalid. Creating new guest session...");
          localStorage.removeItem('placeai_token');
          saved = null;
        }
      }
      
      if (!isValid) {
        try {
          // Create anonymous user with guaranteed valid email and password length
          const randomId = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
          const email = `guest_${randomId}@example.com`;
          const password = randomId + "Password123!";
          
          await apiPost('/auth/register', { email, password, full_name: 'Guest' });
          
          const body = new URLSearchParams({ username: email, password });
          const res = await fetch(`${API_BASE}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          });
          const data = await res.json();
          saved = data.access_token;
          localStorage.setItem('placeai_token', saved);
          setToken(saved);
          
          const me = await apiGet('/auth/me', saved);
          setUser(me);
        } catch (err) {
          console.error("Failed to create guest session:", err);
        }
      }
      
      setLoading(false);
    };
    verifyOrCreate();
  }, []);

  const login = async (email, password) => {
    // OAuth2 form-encoded login
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');

    const { access_token } = data;
    localStorage.setItem('placeai_token', access_token);
    setToken(access_token);

    const me = await apiGet('/auth/me', access_token);
    setUser(me);
    return me;
  };

  const register = async (email, password, fullName) => {
    const data = await apiPost('/auth/register', { email, password, full_name: fullName });
    // Auto-login after registration
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('placeai_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
