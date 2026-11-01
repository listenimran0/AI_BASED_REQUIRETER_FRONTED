import { STATUS_LABEL, type Status } from '@/types';
import { Footer } from './ActionFooter';
import { type BodyProps } from './types';

export function StatusPreview({ action, busy, onConfirm, onCancel }: BodyProps) {
  const p = action.payload;
  const preview = (p.preview || []) as { name: string; score: number | null; from: Status }[];
  const blocked = (p.blocked || []) as { name: string; reason: string }[];
  return (
    <>
      <ul className="preview-list">
        {preview.map((c) => (
          <li key={c.name}>
            <b>{c.name}</b>
            {c.score != null && <span className="pill">score {c.score}</span>}
            <span className="muted small">
              {STATUS_LABEL[c.from]} → {STATUS_LABEL[p.status as Status]}
            </span>
          </li>
        ))}
      </ul>
      {blocked.length > 0 && <div className="muted small">Left out: {blocked.map((b) => `${b.name} (${b.reason})`).join('; ')}</div>}
      <Footer busy={busy} label={`Mark ${preview.length} as ${STATUS_LABEL[p.status as Status]}`} onConfirm={() => onConfirm()} onCancel={onCancel} />
    </>
  );
}
