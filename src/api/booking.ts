import { api } from './client';

export const getBooking = <T>(token: string) => api.get<T>(`/public/booking/${token}`);
export const bookSlot = (token: string, slot: string) => api.post(`/public/booking/${token}`, { slot });
