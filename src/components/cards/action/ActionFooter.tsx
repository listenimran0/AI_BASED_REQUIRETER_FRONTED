import { Icon, Spinner } from '@/components/ui';

export function Footer({
  busy,
  label,
  onConfirm,
  onCancel,
  disabled,
}: {
  busy: boolean;
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="card-foot">
      <button className="btn ghost" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
      <button className="btn primary" onClick={onConfirm} disabled={busy || disabled}>
        {busy ? <Spinner /> : <Icon name="check" />} {label}
      </button>
    </div>
  );
}
