import { type ActionDoc } from '@/types';

export type BodyProps = {
  action: ActionDoc;
  busy: boolean;
  onConfirm: (payload?: Record<string, unknown>) => void;
  onCancel: () => void;
};
