import { api } from './client';

export const approveReply = (draftId: string, edits: { subject: string; body: string }) => api.post(`/replies/${draftId}/approve`, edits);
export const discardReply = (draftId: string) => api.post(`/replies/${draftId}/discard`);
