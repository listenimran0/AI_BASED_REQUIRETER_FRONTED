import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from './api';

export type AppEvent =
  | { type: 'open' }
  | { type: 'message'; conversationId: string; message: any }
  | { type: 'agent'; conversationId: string; status: string | null }
  | { type: 'refresh'; entity: string; jobId?: string; id?: string };

type Handler = (event: AppEvent) => void;

const handlers = new Set<Handler>();
let source: EventSource | null = null;

function connect() {
  if (source) return;
  source = new EventSource(`${API_URL}/api/events`);
  source.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data) as AppEvent;
      handlers.forEach((h) => h(event));
    } catch {
      // not a json frame, nothing to do
    }
  };
  // fires on the first connect and after every automatic reconnect
  source.onopen = () => handlers.forEach((h) => h({ type: 'open' }));
}

export function subscribe(handler: Handler) {
  connect();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function useEvents(handler: Handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => subscribe((e) => ref.current(e)), []);
}

type Match = { jobId?: string; id?: string; entities?: string[] };

export function useLive<T>(load: () => Promise<T>, match: Match, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const matchRef = useRef(match);
  matchRef.current = match;

  const reload = useCallback(
    () =>
      loadRef
        .current()
        .then((value) => {
          setData(value);
          setError(null);
        })
        .catch((err: Error) => setError(err.message)),
    [],
  );

  useEffect(() => {
    setData(null);
    reload();
    let timer: ReturnType<typeof setTimeout>;
    const off = subscribe((e) => {
      const m = matchRef.current;
      const relevant =
        e.type === 'open' ||
        (e.type === 'refresh' &&
          (!m.entities || m.entities.includes(e.entity)) &&
          (!m.jobId || !e.jobId || e.jobId === m.jobId) &&
          (!m.id || !e.id || e.id === m.id));
      if (relevant) {
        clearTimeout(timer);
        timer = setTimeout(reload, 250);
      }
    });
    return () => {
      off();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, reload, setData };
}
