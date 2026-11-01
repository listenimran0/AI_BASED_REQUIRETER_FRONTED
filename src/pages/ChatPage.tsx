import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { api } from '../api';
import { Message } from '../components/Message';
import { useEvents } from '../events';
import type { ChatMessage, Conversation } from '../types';
import { Icon, Spinner, useToast } from '../ui';

const STORAGE_KEY = 'recruiter.conversationId';

export function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(localStorage.getItem(STORAGE_KEY));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const [working, setWorking] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottom = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const upsert = useCallback((incoming: ChatMessage) => {
    setMessages((list) => (list.some((m) => m.id === incoming.id) ? list.map((m) => (m.id === incoming.id ? incoming : m)) : [...list, incoming]));
  }, []);

  const refreshConversation = useCallback(async (id: string) => {
    const c = await api.get<Conversation>(`/conversations/${id}`);
    setActiveJobId(c.activeJobId);
  }, []);

  const start = useCallback(async () => {
    const c = await api.post<Conversation>('/conversations');
    localStorage.setItem(STORAGE_KEY, c.id);
    setConversationId(c.id);
    return c.id;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let id = conversationId;
        let history: ChatMessage[] = [];
        if (id) {
          try {
            history = await api.get<ChatMessage[]>(`/conversations/${id}/messages`);
          } catch {
            id = null;
          }
        }
        if (!id) {
          id = await start();
          history = await api.get<ChatMessage[]>(`/conversations/${id}/messages`);
        }
        if (cancelled) return;
        setMessages(history);
        await refreshConversation(id);
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Could not load the chat');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEvents((e) => {
    if (!conversationId) return;
    if (e.type === 'message' && e.conversationId === conversationId) {
      upsert(e.message as ChatMessage);
      if (e.message.role === 'assistant') refreshConversation(conversationId).catch(() => {});
    }
    if (e.type === 'agent' && e.conversationId === conversationId) setWorking(e.status);
    if (e.type === 'open') {
      // pick up anything missed while the stream was reconnecting
      api.get<ChatMessage[]>(`/conversations/${conversationId}/messages`).then(setMessages).catch(() => {});
    }
  });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, working]);

  const send = async (value: string) => {
    const content = value.trim();
    if (!content || !conversationId || working) return;
    setText('');
    setWorking('Thinking…');
    try {
      const saved = await api.post<ChatMessage>(`/conversations/${conversationId}/messages`, { text: content });
      upsert(saved);
    } catch (err) {
      setWorking(null);
      setText(content);
      toast(err instanceof Error ? err.message : 'Could not send');
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(text);
    }
  };

  const upload = async (file?: File) => {
    if (!file || !conversationId) return;
    if (!activeJobId) {
      toast('Create a job first, then upload candidates for it.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('conversationId', conversationId);
    try {
      await api.post(`/jobs/${activeJobId}/candidates/csv`, form);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const newChat = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setActiveJobId(undefined);
    setConversationId(null);
  };

  return (
    <div className="chat">
      <header className="page-head">
        <div>
          <h1>AI recruiting co-worker</h1>
          <p className="muted">From job description to hire, by chatting.</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost sm" onClick={newChat}><Icon name="plus" size={14} /> New chat</button>
        </div>
      </header>

      <div className="thread">
        {loading && <div className="loading center"><Spinner /> Opening your chat</div>}
        {dedupeCards(messages).map((m) => (
          <Message key={m.id} message={m} onSuggest={send} canSuggest={!working} />
        ))}
        {working && (
          <div className="msg assistant">
            <div className="avatar"><Icon name="sparkle" size={15} /></div>
            <div className="bubble typing"><Spinner size={14} /> {working}</div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div className="composer-wrap">
        <div className="composer">
          <button className="icon-btn" title={activeJobId ? 'Upload a candidate CSV for the current job' : 'Create a job first to upload candidates'} onClick={() => fileInput.current?.click()}>
            <Icon name="clip" size={18} />
          </button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Paste a job description or a link, or ask anything about your hiring…"
            rows={1}
          />
          <button className="send" onClick={() => send(text)} disabled={!text.trim() || !!working} aria-label="Send">
            <Icon name="send" size={18} />
          </button>
        </div>
        <div className="composer-hint">Enter to send, Shift+Enter for a new line. The AI always asks before it changes or sends anything.</div>
      </div>
    </div>
  );
}

// Live cards (a campaign, a reply) update themselves, so showing the same one in several
// messages just repeats it. Keep only the newest copy.
function cardKey(card: { type: string; ref: Record<string, unknown> }) {
  if (card.type === 'campaign') return `campaign:${card.ref.campaignId}`;
  if (card.type === 'replies' && card.ref.replyId) return `reply:${card.ref.replyId}`;
  return null;
}

function dedupeCards(messages: ChatMessage[]): ChatMessage[] {
  const newest = new Map<string, string>();
  for (const m of messages) for (const c of m.cards) {
    const key = cardKey(c);
    if (key) newest.set(key, m.id);
  }
  return messages.map((m) => {
    const cards = m.cards.filter((c) => {
      const key = cardKey(c);
      return !key || newest.get(key) === m.id;
    });
    return cards.length === m.cards.length ? m : { ...m, cards };
  });
}
