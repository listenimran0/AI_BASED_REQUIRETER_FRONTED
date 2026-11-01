import type { ChatMessage, Conversation } from '@/types';
import { api } from './client';

export const createConversation = () => api.post<Conversation>('/conversations');
export const getConversation = (id: string) => api.get<Conversation>(`/conversations/${id}`);
export const listMessages = (id: string) => api.get<ChatMessage[]>(`/conversations/${id}/messages`);
export const sendMessage = (id: string, text: string) => api.post<ChatMessage>(`/conversations/${id}/messages`, { text });
