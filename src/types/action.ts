export type ActionDoc = {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'running' | 'done' | 'cancelled' | 'failed';
  payload: Record<string, any>;
  result?: any;
  error?: string;
};
