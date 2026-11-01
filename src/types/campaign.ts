import type { Status } from './status';

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

export type Campaign = { id: string; name: string; status: string };
