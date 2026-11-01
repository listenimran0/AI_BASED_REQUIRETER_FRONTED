import type { Activity, Campaign, Candidate, Job, JobStats, ReplyItem } from '@/types';
import { api } from './client';

export type CsvImportResult = { added: number; duplicates: number; skipped: unknown[] };

export const listJobs = <T = Job>() => api.get<T[]>('/jobs');
export const getJob = (id: string) => api.get<Job>(`/jobs/${id}`);
export const setAutoReply = (id: string, autoReply: boolean) => api.patch<Job>(`/jobs/${id}`, { autoReply });
export const getJobStats = (id: string) => api.get<JobStats>(`/jobs/${id}/stats`);
export const getJobSummary = (id: string) => api.get<{ summary: string }>(`/jobs/${id}/summary`);
export const listCandidates = (id: string) => api.get<Candidate[]>(`/jobs/${id}/candidates`);
export const listActivity = (id: string, limit: number) => api.get<Activity[]>(`/jobs/${id}/activity?limit=${limit}`);
export const listCampaigns = (id: string) => api.get<Campaign[]>(`/jobs/${id}/campaigns`);
export const listReplies = (id: string) => api.get<ReplyItem[]>(`/jobs/${id}/replies`);
export const uploadCandidatesCsv = (id: string, form: FormData) => api.post<CsvImportResult>(`/jobs/${id}/candidates/csv`, form);
