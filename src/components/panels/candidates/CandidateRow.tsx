import { candidatesApi } from '@/api';
import { STATUS_LABEL, type Candidate, type Status } from '@/types';
import { Icon, ScoreBar, Spinner, StatusBadge } from '@/components/ui';
import { useAction } from '@/hooks/useAction';

const CAN_REPLY: Status[] = ['contacted', 'replied', 'interested', 'not_interested', 'meeting_booked'];

export function Row({ c, onReply, onEmail }: { c: Candidate; onReply: () => void; onEmail: () => void }) {
  const { busy, run } = useAction();
  const move = (to: Status) => run(() => candidatesApi.moveCandidate(c.id, to));
  const moves = c.next.filter((s) => !(c.status === 'sourced' && (s === 'accepted' || s === 'rejected')) && !(c.status === 'accepted' && s === 'rejected'));

  return (
    <tr>
      <td>
        <div className="cell-name">
          {c.profileUrl ? (
            <a href={c.profileUrl} target="_blank" rel="noreferrer">
              {c.name} <Icon name="link" size={12} />
            </a>
          ) : (
            <b>{c.name}</b>
          )}
          {c.source === 'mock-search' && <span className="pill">sample</span>}
          {c.injectionFlag && (
            <span className="pill warn" title="This profile contains text that looks like instructions to an AI. It was ignored, please review it yourself.">
              <Icon name="warn" size={12} /> flagged
            </span>
          )}
        </div>
        <div className="muted small">{[c.headline, c.company].filter(Boolean).join(' · ') || 'No headline'}</div>
        <div className="muted small">
          {c.email || 'no email'}{' '}
          {!['hired', 'rejected', 'unsubscribed'].includes(c.status) && (
            <button className="link-btn" onClick={onEmail}>
              {c.email ? 'edit' : 'add email'}
            </button>
          )}
        </div>
      </td>
      <td>
        <ScoreBar score={c.score} />
      </td>
      <td className="why">
        {c.scoreError ? (
          <span className="error-text">Could not score: {c.scoreError}</span>
        ) : (
          c.scoreReason || <span className="muted">Scoring in progress</span>
        )}
        {(c.matchedSkills?.length > 0 || c.missingSkills?.length > 0) && (
          <div className="skill-row">
            {c.matchedSkills.slice(0, 5).map((s) => (
              <span key={s} className="skill yes">
                {s}
              </span>
            ))}
            {c.missingSkills.slice(0, 4).map((s) => (
              <span key={s} className="skill no">
                {s}
              </span>
            ))}
          </div>
        )}
      </td>
      <td>
        <StatusBadge status={c.status} />
        {c.status === 'interested' && c.bookingToken && (
          <div className="small">
            <a href={`/book/${c.bookingToken}`} target="_blank" rel="noreferrer">
              Booking page
            </a>
          </div>
        )}
      </td>
      <td className="actions">
        {busy && <Spinner />}
        {c.status === 'sourced' && (
          <>
            <button className="btn sm ok" disabled={busy} onClick={() => move('accepted')}>
              Accept
            </button>
            <button className="btn sm ghost" disabled={busy} onClick={() => move('rejected')}>
              Reject
            </button>
          </>
        )}
        {c.status === 'accepted' && (
          <button className="btn sm ghost" disabled={busy} onClick={() => move('rejected')}>
            Reject
          </button>
        )}
        {moves.length > 0 && (
          <select
            className="select sm"
            value=""
            disabled={busy}
            onChange={(e) => e.target.value && move(e.target.value as Status)}
            aria-label={`Move ${c.name}`}
          >
            <option value="">Move to…</option>
            {moves.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}
        {CAN_REPLY.includes(c.status) && (
          <button className="btn sm ghost" onClick={onReply} title="Pretend this candidate wrote back">
            <Icon name="mail" size={13} /> Simulate reply
          </button>
        )}
      </td>
    </tr>
  );
}
