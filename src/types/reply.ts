import type { Candidate } from './candidate';
import type { OutreachMessage } from './campaign';

export type ReplyItem = {
  id: string;
  text: string;
  label?: 'interested' | 'not_interested' | 'question' | 'wants_meeting' | 'unsubscribe';
  confidence?: number;
  rationale?: string;
  injectionFlag: boolean;
  handled: boolean;
  autoSent: boolean;
  autoNote?: string;
  error?: string;
  createdAt: string;
  candidate?: Candidate;
  draft?: OutreachMessage | null;
};
