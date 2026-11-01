import { useCallback, useState } from 'react';
import { useToast } from '@/context/ToastContext';

export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      setBusy(true);
      try {
        return await fn();
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );
  return { busy, run };
}
