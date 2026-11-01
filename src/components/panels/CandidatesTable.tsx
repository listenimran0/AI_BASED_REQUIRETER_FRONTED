import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useLive } from '../../events';
import { STATUS_LABEL, type Candidate, type Status } from '../../types';
import { Empty, Icon, Modal, ScoreBar, Spinner, StatusBadge, useAction, useToast } from '../../ui';

const REPLY_PRESETS = [
  { label: 'Interested', text: 'Thanks for reaching out, this sounds interesting. Could you tell me a bit more about the role?' },
  { label: 'Wants a meeting', text: 'This looks like a great fit. I would love to talk, are you free for a call this week?' },
  { label: 'Question', text: 'Thanks for the note. Is the position fully remote, and what does the interview process look like?' },
  { label: 'Not interested', text: 'Thank you, but I am happy where I am and not looking right now.' },
  { label: 'Unsubscribe', text: 'Please unsubscribe me and do not contact me again.' },
];

const CAN_REPLY: Status[] = ['contacted', 'replied', 'interested', 'not_interested', 'meeting_booked'];

type Props = { jobId: string; mode: 'review' | 'all'; status?: Status | null; limit?: number };

export function CandidatesTable({ jobId, mode, status, limit }: Props) {
  const [filter, setFilter] = useState<Status | 'all'>(status || 'all');
  const [query, setQuery] = useState('');
  const [replyFor, setReplyFor] = useState<Candidate | null>(null);
  const [emailFor, setEmailFor] = useState<Candidate | null>(null);

  const { data, error } = useLive(
    () => api.get<Candidate[]>(`/jobs/${jobId}/candidates`),
    { jobId, entities: ['candidate', 'run'] },
    [jobId],
  );

  if (error) return <div className="error-text">{error}</div>;
  if (!data) return <div className="loading"><Spinner /> Loading candidates</div>;
  if (!data.length) return <Empty title="No candidates yet" hint="Start sourcing in the chat, or upload a CSV." />;

  const counts = data.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  let rows = data.filter((c) => (filter === 'all' ? true : c.status === filter));
  if (query.trim()) {
    const q = query.toLowerCase();
    rows = rows.filter((c) => [c.name, c.headline, c.email, c.company].some((v) => v?.toLowerCase().includes(q)));
  }
  const total = rows.length;
  if (limit) rows = rows.slice(0, limit);

  return (
    <div className="table-wrap">
      {mode === 'all' && (
        <div className="table-tools">
          <div className="chips">
            <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              All <span>{data.length}</span>
            </button>
            {(Object.keys(counts) as Status[]).map((s) => (
              <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
                {STATUS_LABEL[s]} <span>{counts[s]}</span>
              </button>
            ))}
          </div>
          <input className="search" placeholder="Search name, title, email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Score</th>
            <th>Why</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <Row key={c.id} c={c} onReply={() => setReplyFor(c)} onEmail={() => setEmailFor(c)} />
          ))}
        </tbody>
      </table>

      {limit && total > limit && (
        <div className="table-foot">
          Showing {limit} of {total}. <Link to={`/jobs/${jobId}`}>Open the full list</Link>
        </div>
      )}
      {!rows.length && <Empty title="No candidates match" />}
      {replyFor && <ReplyModal candidate={replyFor} onClose={() => setReplyFor(null)} />}
      {emailFor && <EmailModal candidate={emailFor} onClose={() => setEmailFor(null)} />}
    </div>
  );
}

function Row({ c, onReply, onEmail }: { c: Candidate; onReply: () => void; onEmail: () => void }) {
  const { busy, run } = useAction();
  const move = (to: Status) => run(() => api.patch(`/candidates/${c.id}/status`, { status: to }));
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
            <button className="link-btn" onClick={onEmail}>{c.email ? 'edit' : 'add email'}</button>
          )}
        </div>
      </td>
      <td>
        <ScoreBar score={c.score} />
      </td>
      <td className="why">
        {c.scoreError ? <span className="error-text">Could not score: {c.scoreError}</span> : c.scoreReason || <span className="muted">Scoring in progress</span>}
        {(c.matchedSkills?.length > 0 || c.missingSkills?.length > 0) && (
          <div className="skill-row">
            {c.matchedSkills.slice(0, 5).map((s) => (
              <span key={s} className="skill yes">{s}</span>
            ))}
            {c.missingSkills.slice(0, 4).map((s) => (
              <span key={s} className="skill no">{s}</span>
            ))}
          </div>
        )}
      </td>
      <td>
        <StatusBadge status={c.status} />
        {c.status === 'interested' && c.bookingToken && (
          <div className="small">
            <a href={`/book/${c.bookingToken}`} target="_blank" rel="noreferrer">Booking page</a>
          </div>
        )}
      </td>
      <td className="actions">
        {busy && <Spinner />}
        {c.status === 'sourced' && (
          <>
            <button className="btn sm ok" disabled={busy} onClick={() => move('accepted')}>Accept</button>
            <button className="btn sm ghost" disabled={busy} onClick={() => move('rejected')}>Reject</button>
          </>
        )}
        {c.status === 'accepted' && (
          <button className="btn sm ghost" disabled={busy} onClick={() => move('rejected')}>Reject</button>
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
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
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

function ReplyModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [text, setText] = useState(REPLY_PRESETS[1].text);
  const { busy, run } = useAction();
  const toast = useToast();

  const send = async () => {
    const result = await run(() => api.post('/simulate-reply', { candidateId: candidate.id, text }));
    if (result) {
      toast('Reply received. The AI is classifying it.', 'ok');
      onClose();
    }
  };

  return (
    <Modal title={`Simulate a reply from ${candidate.name}`} onClose={onClose}>
      <div className="chips tight">
        {REPLY_PRESETS.map((p) => (
          <button key={p.label} className="chip" onClick={() => setText(p.text)}>{p.label}</button>
        ))}
      </div>
      <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={busy || !text.trim()} onClick={send}>
          {busy ? <Spinner /> : <Icon name="send" />} Send reply
        </button>
      </div>
    </Modal>
  );
}

function EmailModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [email, setEmail] = useState(candidate.email || '');
  const { busy, run } = useAction();
  const toast = useToast();

  const save = async () => {
    const result = await run(() => api.patch(`/candidates/${candidate.id}/email`, { email }));
    if (result) {
      toast('Email saved', 'ok');
      onClose();
    }
  };

  return (
    <Modal title={`Email for ${candidate.name}`} onClose={onClose}>
      <input className="input" type="email" autoFocus placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={busy || !email.trim()} onClick={save}>
          {busy ? <Spinner /> : null} Save
        </button>
      </div>
    </Modal>
  );
}
