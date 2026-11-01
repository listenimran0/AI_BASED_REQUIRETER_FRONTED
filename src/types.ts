export type Status =
  | 'sourced'
  | 'accepted'
  | 'rejected'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'not_interested'
  | 'meeting_booked'
  | 'interviewed'
  | 'shortlisted'
  | 'hired'
  | 'unsubscribed';

export const STATUS_LABEL: Record<Status, string> = {
  sourced: 'Sourced',
  accepted: 'Accepted',
  rejected: 'Rejected',
  contacted: 'Contacted',
  replied: 'Replied',
  interested: 'Interested',
  not_interested: 'Not interested',
  meeting_booked: 'Meeting booked',
  interviewed: 'Interviewed',
  shortlisted: 'Shortlisted',
  hired: 'Hired',
  unsubscribed: 'Unsubscribed',
};

export type CardRef = { type: string; ref: Record<string, any> };

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  cards: CardRef[];
  createdAt: string;
};

export type Conversation = { id: string; title: string; activeJobId?: string };

export type Job = {
  id: string;
  title: string;
  seniority?: string;
  location?: string;
  remotePolicy: string;
  salary?: { min?: number; max?: number; currency?: string; text?: string };
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  summary?: string;
  autoReply: boolean;
  createdAt: string;
};

export type Candidate = {
  id: string;
  jobId: string;
  name: string;
  email?: string;
  profileUrl?: string;
  headline?: string;
  company?: string;
  location?: string;
  skills: string[];
  source: string;
  status: Status;
  score?: number | null;
  scoreReason?: string;
  matchedSkills: string[];
  missingSkills: string[];
  dataQuality?: string;
  scoreError?: string;
  injectionFlag: boolean;
  bookingToken?: string;
  next: Status[];
};

export type JobStats = {
  jobId: string;
  totalCandidates: number;
  funnel: { status: Status; label: string; reached: number; now: number }[];
  current: Record<string, number>;
  rejected: number;
  unsubscribed: number;
  notInterested: number;
  emailsSent: number;
  repliesReceived: number;
  pendingReplyDrafts: number;
  replyRate: number;
  interestedRate: number;
  meetings: number;
  hires: number;
  scoring: { scored: number; average: number | null; top: number | null };
  cost: { calls: number; promptTokens: number; completionTokens: number; usd: number };
};

export type Run = {
  id: string;
  jobId: string;
  kind: 'web' | 'csv';
  status: 'queued' | 'searching' | 'scoring' | 'done' | 'failed';
  target: number;
  found: number;
  duplicates: number;
  scored: number;
  failed: number;
  note?: string;
  error?: string;
};

export type OutreachMessage = {
  id: string;
  candidateId: string;
  stepIndex: number;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'skipped' | 'cancelled';
  scheduledFor?: string;
  sentAt?: string;
  note?: string;
  error?: string;
  kind: 'outreach' | 'reply';
};

export type CampaignDetail = {
  campaign: {
    id: string;
    jobId: string;
    name: string;
    status: 'drafting' | 'ready' | 'active' | 'paused' | 'completed' | 'failed';
    steps: { dayOffset: number; goal: string }[];
    dailyLimit: number;
    candidateIds: string[];
  };
  items: { candidate: { id: string; name: string; email?: string; score?: number; status: Status }; messages: OutreachMessage[] }[];
  progress: { total: number; drafted: number; failed: number; sent: number };
};

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

export type Activity = {
  id: string;
  actor: string;
  type: string;
  message: string;
  createdAt: string;
};

export type ActionDoc = {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'failed';
  payload: Record<string, any>;
  result?: any;
  error?: string;
};
