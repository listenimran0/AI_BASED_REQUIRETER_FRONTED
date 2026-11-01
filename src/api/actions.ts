import type { ActionDoc } from '@/types';
import { api } from './client';

export const getAction = (id: string) => api.get<ActionDoc>(`/actions/${id}`);
export const confirmAction = (id: string, payload?: Record<string, unknown>) => api.post(`/actions/${id}/confirm`, payload ? { payload } : {});
export const cancelAction = (id: string) => api.post(`/actions/${id}/cancel`);
