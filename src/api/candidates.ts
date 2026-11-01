import type { Status } from '@/types';
import { api } from './client';

export const moveCandidate = (id: string, status: Status) => api.patch(`/candidates/${id}/status`, { status });
export const setCandidateEmail = (id: string, email: string) => api.patch(`/candidates/${id}/email`, { email });
export const simulateReply = (candidateId: string, text: string) => api.post('/simulate-reply', { candidateId, text });
