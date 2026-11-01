import { createContext, useCallback, useContext, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { STATUS_LABEL, type Status } from './types';

const PATHS: Record<string, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  send: 'M4 12l16-8-6 16-3-7-7-1z',
  clip: 'M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.3 3.3 0 014.7 4.7L10 17a1.7 1.7 0 01-2.4-2.4l7-7',
  plus: 'M12 5v14M5 12h14',
  chart: 'M5 20V10m7 10V4m7 16v-7',
  users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1m17 0v-1a4 4 0 00-3-3.9M14 4.1a4 4 0 010 7.8M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  chat: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  warn: 'M12 4l9 16H3L12 4zM12 10v4m0 3h.01',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6l1-7z',
  edit: 'M4 20h4l10-10-4-4L4 16v4zM13 7l4 4',
  chevron: 'M9 6l6 6-6 6',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
};

export function Icon({ name, size = 16 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name] || ''} />
    </svg>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge st-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function ScoreBar({ score }: { score?: number | null }) {
  if (score == null) return <span className="muted small">pending</span>;
  const tone = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';
  return (
    <div className="score">
      <div className="score-track">
        <div className={`score-fill ${tone}`} style={{ width: `${score}%` }} />
      </div>
      <b>{score}</b>
    </div>
  );
}

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(',').map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setText('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="tags-input">
      {value.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} onBlur={add} placeholder={value.length ? '' : placeholder} />
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {hint && <span>{hint}</span>}
    </div>
  );
}

type ToastItem = { id: number; text: string; tone: 'error' | 'ok' };
const ToastContext = createContext<(text: string, tone?: 'error' | 'ok') => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: 'error' | 'ok' = 'error') => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, text, tone }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      setBusy(true);
      try {
        return await fn();
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );
  return { busy, run };
}

export function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
