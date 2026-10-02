// src/components/Sidebar.jsx
import { useState } from 'react';

export default function Sidebar({ user, sessions, activeId, onSelect, onNew, onDelete, onLogout }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🤖</div>
          <div className="logo-text">
            <div className="logo-title">Warehouse AI</div>
            <div className="logo-subtitle">Powered by Vanna</div>
          </div>
        </div>
        <button id="new-chat-btn" className="new-chat-btn" onClick={onNew}>
          ✏️ New Chat
        </button>
      </div>

      {/* History */}
      <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="sidebar-section-label">Conversations</div>
        {sessions.length === 0 ? (
          <div className="empty-sidebar">No conversations yet.<br />Start chatting below!</div>
        ) : (
          sessions.map(s => (
            <div
              key={s.id}
              className={`sidebar-item ${s.id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(s.id)}
              title={s.title}
            >
              <span className="item-icon">💬</span>
              <span className="item-text">{s.title}</span>
              <button
                className="del-btn"
                onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                title="Delete"
              >✕</button>
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Quick Ask</div>
        {[
          { icon: '📦', text: 'Low stock items' },
          { icon: '💰', text: 'Most expensive products' },
          { icon: '📊', text: 'Total inventory value' },
          { icon: '🧠', text: 'Show my saved memories' },
        ].map((q, i) => (
          <div
            key={i}
            className="sidebar-item"
            onClick={() => onNew(q.text)}
          >
            <span className="item-icon">{q.icon}</span>
            <span className="item-text">{q.text}</span>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="sidebar-footer">
        <div
          className="user-badge"
          onClick={onLogout}
          style={{ cursor: 'pointer' }}
          title="Click to sign out"
        >
          <div className="user-avatar">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="user-info">
            <div className="user-email">{user?.email}</div>
            <div className="user-role">{user?.group} · click to sign out</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
