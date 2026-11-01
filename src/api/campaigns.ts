import type { CampaignDetail } from '@/types';
import { api } from './client';

export const getCampaign = (id: string) => api.get<CampaignDetail>(`/campaigns/${id}`);
export const campaignAction = (id: string, action: 'approve' | 'pause' | 'resume') => api.post(`/campaigns/${id}/${action}`);
export const updateDraft = (id: string, edits: { subject: string; body: string }) => api.patch(`/outreach/${id}`, edits);
export const skipDraft = (id: string) => api.post(`/outreach/${id}/skip`);
