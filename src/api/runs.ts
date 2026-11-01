import type { Run } from '@/types';
import { api } from './client';

export const getRun = (id: string) => api.get<Run>(`/runs/${id}`);
