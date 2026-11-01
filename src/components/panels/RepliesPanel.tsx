import { useState } from 'react';
import { api } from '../../api';
import { useLive } from '../../events';
import type { ReplyItem } from '../../types';
import { Empty, Icon, Spinner, StatusBadge, formatDate, pct, useAction } from '../../ui';

const LABEL: Record<string, string> = {
  interested: 'Interested',
  wants_meeting: 'Wants a meeting',
  question: 'Question',
  not_interested: 'Not interested',
  unsubscribe: 'Unsubscribe',
};

export function RepliesPanel({ jobId, pendingOnly, replyId }: { jobId: string; pendingOnly?: boolean; replyId?: string }) {
  const { data, error } = useLive(
    () => api.get<ReplyItem[]>(`/jobs/${jobId}/replies`),
    { jobId, entities: ['reply', 'candidate'] },
    [jobId],
  );

  if (error) return <div className="error-text">{error}</div>;
  if (!data) return <div className="loading"><Spinner /> Loading replies</div>;

  const list = replyId ? data.filter((r) => r.id === replyId) : pendingOnly ? data.filter((r) => r.draft?.status === 'draft') : data;
  if (!list.length) return <Empty title={pendingOnly ? 'No drafts waiting' : 'No replies yet'} hint="Use “Simulate reply” on a contacted candidate to try it." />;

  return (
    <div className="replies">
      {list.map((r) => (
        <Reply key={r.id} reply={r} />
      ))}
    </div>
  );
}

function DraftEditor({ draft }: { draft: NonNullable<ReplyItem['draft']> }) {
  // mounted with key={draft.id}, so the fields always start from the real draft text
  const [subject, setSubject] = useState(draft.subject || '');
  const [body, setBody] = useState(draft.body || '');
  const { busy, run } = useAction();
  return (
    <>
      <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
      <textarea className="input" rows={7} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Body" />
      <div className="row-actions">
        <button className="btn ghost sm" disabled={busy} onClick={() => run(() => api.post(`/replies/${draft.id}/discard`))}>Discard</button>
        <button className="btn primary sm" disabled={busy} onClick={() => run(() => api.post(`/replies/${draft.id}/approve`, { subject, body }))}>
          {busy ? <Spinner /> : <Icon name="send" size={14} />} Approve and send
        </button>
      </div>
    </>
  );
}

function Reply({ reply }: { reply: ReplyItem }) {
  const draft = reply.draft;
  const waiting = draft?.status === 'draft';

  return (
    <div className="reply">
      <div className="reply-head">
        <b>{reply.candidate?.name || 'Candidate'}</b>
        {reply.candidate && <StatusBadge status={reply.candidate.status} />}
        {reply.label ? (
          <span className={`pill lab-${reply.label}`}>
            {LABEL[reply.label]} {reply.confidence != null && <span className="muted">{pct(reply.confidence)}</span>}
          </span>
        ) : reply.error ? (
          <span className="pill warn">could not classify</span>
        ) : (
          <span className="pill"><Spinner size={11} /> classifying</span>
        )}
        {reply.injectionFlag && (
          <span className="pill warn" title="The message contains text that looks like instructions to an AI. It was treated as plain data and cannot be auto-answered.">
            <Icon name="warn" size={12} /> flagged
          </span>
        )}
        <span className="grow" />
        <span className="muted small">{formatDate(reply.createdAt)}</span>
      </div>

      <blockquote>{reply.text}</blockquote>
      {reply.rationale && <div className="muted small">AI reasoning: {reply.rationale}</div>}
      {reply.autoNote && !reply.autoSent && <div className="muted small">Not auto-sent: {reply.autoNote}</div>}

      {draft && (
        <div className="email">
          <div className="small muted">
            {waiting ? 'Draft reply, waiting for your approval' : draft.status === 'sent' ? `Reply sent ${formatDate(draft.sentAt)}${reply.autoSent ? ' automatically' : ''}` : draft.status === 'scheduled' ? 'Reply is being sent' : `Draft ${draft.status}`}
          </div>
          {waiting ? (
            <DraftEditor key={draft.id} draft={draft} />
          ) : (
            <pre>{draft.body}</pre>
          )}
        </div>
      )}
      {!draft && reply.handled && reply.label && <div className="muted small">No reply drafted for this one.</div>}
    </div>
  );
}
