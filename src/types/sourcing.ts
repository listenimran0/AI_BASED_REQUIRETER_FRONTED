export type Run = {
  id: string;
  jobId: string;
  kind: 'web' | 'csv';
  status: 'queued' | 'searching' | 'scoring' | 'done' | 'failed';
  target: number;
  found: number;
  duplicates: number;
  scored: number;
  failed: number;
  note?: string;
  error?: string;
};
