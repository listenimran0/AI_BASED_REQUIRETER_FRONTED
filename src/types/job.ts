import type { Status } from './status';

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
