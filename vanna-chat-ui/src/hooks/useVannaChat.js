// src/hooks/useVannaChat.js
// Core SSE chat hook — talks to the Vanna agent backend

import { useState, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';

/**
 * Parse an SSE chunk from Vanna and extract displayable text.
 * Vanna sends: { rich: { type, data }, simple: {...}, conversation_id, ... }
 */
function extractText(chunk) {
  if (!chunk || !chunk.rich) return null;
  const { type, data } = chunk.rich;

  switch (type) {
    case 'text_delta':
      return data?.text ?? data?.content ?? null;
    case 'text':
      return data?.text ?? data?.content ?? null;
    case 'markdown':
      return data?.content ?? data?.text ?? null;
    case 'message':
      return data?.content ?? data?.text ?? null;
    case 'status_bar_update':
      // Tool activity — show as a chip, not main text
      return null;
    case 'error':
      return `❌ ${data?.message ?? 'Unknown error'}`;
    default:
      // Fallback: try to get any text-like field
      return data?.text ?? data?.content ?? data?.message ?? null;
  }
}

/**
 * Extract tool chip info for live status display
 */
function extractToolActivity(chunk) {
  if (!chunk?.rich) return null;
  const { type, data } = chunk.rich;
  if (type === 'status_bar_update') {
    return { status: data?.status ?? 'running', message: data?.message ?? 'Working...' };
  }
  return null;
}

export function useVannaChat(email) {
  const [messages, setMessages]       = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivity, setToolActivity] = useState(null);
  const conversationId = useRef(null);
  const abortRef       = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    // Add user bubble
    const userMsg = { id: Date.now(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Placeholder bot bubble we'll stream into
    const botId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botId, role: 'assistant', text: '', streaming: true, timestamp: new Date() }]);
    setIsStreaming(true);
    setToolActivity(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch(`${API_BASE}/api/vanna/v2/chat_sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: ctrl.signal,
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId.current ?? undefined,
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;

          try {
            const chunk = JSON.parse(raw);

            // Capture conversation ID from first chunk
            if (chunk.conversation_id && !conversationId.current) {
              conversationId.current = chunk.conversation_id;
            }

            // Tool activity
            const activity = extractToolActivity(chunk);
            if (activity) setToolActivity(activity);

            // Text delta
            const delta = extractText(chunk);
            if (delta) {
              accumulated += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === botId ? { ...m, text: accumulated } : m
                )
              );
            }

            // Image / Attachment capture
            if (chunk?.rich?.type === 'image' || chunk?.rich?.type === 'attachment' || chunk?.rich?.type === 'file') {
              const fileData = chunk.rich.data?.base64 || chunk.rich.data?.image || chunk.rich.data?.content || chunk.rich.data?.data;
              const fileName = chunk.rich.data?.filename || chunk.rich.data?.name || chunk.rich.data?.file_name || 'visualization.png';
              
              if (fileData) {
                setMessages(prev =>
                  prev.map(m => {
                    if (m.id === botId) {
                      const newAtt = { ...(m.attachments || {}), [fileName]: fileData };
                      return { ...m, attachments: newAtt };
                    }
                    return m;
                  })
                );
              }
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Mark streaming done
      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === botId
              ? { ...m, text: `⚠️ Connection error: ${err.message}`, streaming: false }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setToolActivity(null);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    conversationId.current = null;
    setMessages([]);
  }, []);

  return { messages, isStreaming, toolActivity, sendMessage, stopStreaming, clearMessages };
}
