import { useEffect, useRef } from 'react';
import { subscribe, type AppEvent } from '@/lib/events';

export function useEvents(handler: (event: AppEvent) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => subscribe((e) => ref.current(e)), []);
}
