import { API_URL } from '@/api';

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
