// src/components/MessageBubble.jsx
import { useEffect, useRef } from 'react';

function formatTime(date) {
  return date instanceof Date
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
}

function renderText(text, attachments) {
  if (!text) return null;

  // Split on code fences first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
      return <pre key={i}><code>{code}</code></pre>;
    }

    // Inline markdown on each line
    const lines = part.split('\n');
    return (
      <span key={i}>
        {lines.map((line, j) => (
          <span key={j}>
            {renderInline(line, attachments)}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

function renderInline(text, attachments) {
  // Split on images, **bold**, `code`, and URLs
  const tokens = text.split(/(!\[.*?\]\(.*?\)|\*\*.*?\*\*|`[^`]+`|https?:\/\/\S+)/g);
  return tokens.map((tok, i) => {
    const imgMatch = tok.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      let url = imgMatch[2];
      if (url.startsWith('attachment://') && attachments) {
        const filename = url.replace('attachment://', '');
        const data = attachments[filename];
        if (data) {
          url = data.startsWith('data:') ? data : `data:image/png;base64,${data}`;
        }
      }
      return <img key={i} src={url} alt={alt} style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)', marginTop: '8px' }} />;
    }

    if (tok.startsWith('**') && tok.endsWith('**'))
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    if (tok.startsWith('`') && tok.endsWith('`'))
      return <code key={i}>{tok.slice(1, -1)}</code>;
    if (tok.match(/^https?:\/\//))
      return <a key={i} href={tok} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-hover)' }}>{tok}</a>;
    return tok;
  });
}

export default function MessageBubble({ message }) {
  const { role, text, streaming, timestamp, attachments } = message;
  const isUser = role === 'user';
  const endRef = useRef(null);

  useEffect(() => {
    if (streaming) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [text, streaming]);

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`msg-avatar ${isUser ? 'user-av' : 'bot-av'}`}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="msg-content">
        <div className="msg-meta">
          <span>{isUser ? 'You' : 'Warehouse AI'}</span>
          <span>·</span>
          <span>{formatTime(timestamp)}</span>
          {streaming && <span style={{ color: 'var(--accent)' }}>● streaming</span>}
        </div>

        <div className="msg-bubble">
          {text ? renderText(text, attachments) : (
            streaming ? (
              <div className="typing-bubble" style={{ background: 'none', border: 'none', padding: 0 }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            ) : null
          )}
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
