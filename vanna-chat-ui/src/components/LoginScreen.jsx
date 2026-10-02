// src/components/LoginScreen.jsx
import { useState } from 'react';

const QUICK_ACCOUNTS = [
  { label: '👤 User', email: 'user@example.com' },
  { label: '🛡️ Admin', email: 'admin@example.com' },
];

export default function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) onLogin(email.trim());
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-hero">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">Warehouse AI</h1>
          <p className="login-subtitle">Your intelligent inventory assistant</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div>
            <label className="form-label" htmlFor="email-input">Email address</label>
            <input
              id="email-input"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '12px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}

          <button
            id="login-submit-btn"
            className="login-btn"
            type="submit"
            disabled={loading || !email.trim()}
          >
            {loading ? '⏳ Signing in…' : 'Continue →'}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => onLogin(acc.email)}
                disabled={loading}
                style={{
                  flex: 1, padding: '8px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.target.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
              >
                {acc.label}
              </button>
            ))}
          </div>

          <p className="login-hint">Use admin@example.com for full memory access</p>
        </form>
      </div>
    </div>
  );
}
