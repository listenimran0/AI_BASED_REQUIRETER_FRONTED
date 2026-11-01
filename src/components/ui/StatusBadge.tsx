import { STATUS_LABEL, type Status } from '@/types';

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge st-${status}`}>{STATUS_LABEL[status]}</span>;
}
