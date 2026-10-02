// src/hooks/useAuth.js
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:8001';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const login = useCallback(async (email) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v0/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`Login failed (${res.status})`);
      const data = await res.json();
      const group = email === 'admin@example.com' ? 'admin' : 'user';
      setUser({ email: data.email, group });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return { user, loading, error, login, logout };
}
