import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { useVannaChat } from './hooks/useVannaChat';

export default function App() {
  const [activeSessionId] = useState('default');
  const [input, setInput] = useState('');

  const user = { email: 'guest@example.com', group: 'user' };

  const {
    messages,
    isStreaming,
    toolActivity,
    sendMessage,
    stopStreaming,
    clearMessages
  } = useVannaChat(user.email);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="app">
      <Sidebar
        user={user}
        sessions={[{ id: 'default', title: 'Current Chat' }]}
        activeId={activeSessionId}
        onSelect={() => { }}
        onNew={(text) => {
          clearMessages();
          if (typeof text === 'string') {
            sendMessage(text);
          }
        }}
        onDelete={() => clearMessages()}
        onLogout={() => { }}
      />

      <main className="chat-area">
        <header className="chat-header">
          <div>
            <h2 className="chat-title">Warehouse Assistant</h2>
            {/* <div className="chat-meta">Powered by Vanna AI</div> */}
          </div>
          <div className="badge badge-online">Agent Ready</div>
        </header>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">Hi, </div>
              <h1 className="welcome-title">How can I help you?</h1>
              <p className="welcome-desc">Ask me questions about your warehouse inventory, stock levels, and more.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}

          {toolActivity && (
            <div style={{ padding: '0 24px', opacity: 0.7, alignSelf: 'flex-start' }}>
              <div className={`tool-chip ${toolActivity.status}`}>
                {toolActivity.status === 'running' ? '⏳' : '✅'} {toolActivity.message}
              </div>
            </div>
          )}
        </div>

        <form className="input-area" onSubmit={handleSend}>
          <div className="input-wrapper">
            <textarea
              className="chat-textarea"
              placeholder="Message Warehouse AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            {isStreaming ? (
              <button type="button" className="send-btn" onClick={stopStreaming} title="Stop generation">
                ⏹️
              </button>
            ) : (
              <button type="submit" className="send-btn" disabled={!input.trim()}>
                ↑
              </button>
            )}
          </div>
          <div className="input-footer">
            {/* <div className="input-hint">Vanna AI can make mistakes. Consider verifying important data.</div> */}
            <div className="input-hint">Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line</div>
          </div>
        </form>
      </main>
    </div>
  );
}
