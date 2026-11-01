import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from '@/lib/events';

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
