import { useState } from 'react';
import { api } from '../../api';
import { useLive } from '../../events';
import type { CampaignDetail, OutreachMessage } from '../../types';
import { Empty, Icon, Spinner, formatDate, useAction, useToast } from '../../ui';

type Item = CampaignDetail['items'][number];

const STATE_LABEL: Record<string, string> = {
  drafting: 'Drafting',
  ready: 'Ready for approval',
  active: 'Sending',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
};

export function CampaignPanel({ campaignId }: { campaignId: string }) {
  const { data, error, reload } = useLive(
    () => api.get<CampaignDetail>(`/campaigns/${campaignId}`),
    { id: campaignId, entities: ['campaign'] },
    [campaignId],
  );
  const { busy, run } = useAction();
  const [open, setOpen] = useState<string | null>(null);

  if (error) return <div className="error-text">{error}</div>;
  if (!data) return <div className="loading"><Spinner /> Loading campaign</div>;

  const { campaign, items, progress } = data;
  const drafts = items.reduce((n, i) => n + i.messages.filter((m) => m.status === 'draft').length, 0);
  const totalEmails = items.reduce((n, i) => n + i.messages.length, 0);
  const sentEmails = items.reduce((n, i) => n + i.messages.filter((m) => m.status === 'sent').length, 0);

  const call = (path: string) => run(async () => { await api.post(path); await reload(); });

  return (
    <div className="campaign">
      <div className="campaign-head">
        <div>
          <b>{campaign.name}</b>
          <div className="steps-line">
            {campaign.steps.map((s, i) => (
              <span key={i} className="step-pill" title={s.goal}>Day {s.dayOffset}</span>
            ))}
            <span className="muted small">· up to {campaign.dailyLimit} sends per day</span>
          </div>
        </div>
        <span className={`badge camp-${campaign.status}`}>{STATE_LABEL[campaign.status]}</span>
      </div>

      {campaign.status === 'drafting' && (
        <div className="progress">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${(progress.drafted / Math.max(1, progress.total)) * 100}%` }} /></div>
          <span className="small muted"><Spinner size={12} /> Drafted {progress.drafted} of {progress.total}{progress.failed ? `, ${progress.failed} failed` : ''}</span>
        </div>
      )}

      {['active', 'paused', 'completed'].includes(campaign.status) && (
        <div className="progress">
          <div className="progress-track"><div className="progress-fill ok" style={{ width: `${(sentEmails / Math.max(1, totalEmails)) * 100}%` }} /></div>
          <span className="small muted">{sentEmails} of {totalEmails} emails sent</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="recipients">
          {items.map((item) => (
            <Recipient
              key={item.candidate.id}
              item={item}
              steps={campaign.steps}
              open={open === item.candidate.id}
              onToggle={() => setOpen(open === item.candidate.id ? null : item.candidate.id)}
              editable={campaign.status === 'ready'}
            />
          ))}
        </div>
      )}
      {!items.length && campaign.status !== 'drafting' && <Empty title="No drafts" />}

      <div className="campaign-actions">
        {campaign.status === 'ready' && (
          <>
            <span className="muted small">Nothing is sent until you approve. You can edit any email first.</span>
            <button className="btn primary" disabled={busy || !drafts} onClick={() => call(`/campaigns/${campaignId}/approve`)}>
              {busy ? <Spinner /> : <Icon name="send" />} Approve and send {drafts} emails
            </button>
          </>
        )}
        {campaign.status === 'active' && (
          <button className="btn ghost" disabled={busy} onClick={() => call(`/campaigns/${campaignId}/pause`)}>
            <Icon name="pause" /> Pause campaign
          </button>
        )}
        {campaign.status === 'paused' && (
          <button className="btn primary" disabled={busy} onClick={() => call(`/campaigns/${campaignId}/resume`)}>
            <Icon name="play" /> Resume campaign
          </button>
        )}
      </div>
    </div>
  );
}

function Recipient({ item, steps, open, onToggle, editable }: { item: Item; steps: { dayOffset: number; goal: string }[]; open: boolean; onToggle: () => void; editable: boolean }) {
  const [step, setStep] = useState(0);
  const { busy, run } = useAction();
  const drafts = item.messages.filter((m) => m.status === 'draft');
  const current = item.messages.find((m) => m.stepIndex === step) || item.messages[0];
  const removed = item.messages.length > 0 && item.messages.every((m) => m.status === 'cancelled');

  const remove = () => run(async () => { for (const d of drafts) await api.post(`/outreach/${d.id}/skip`); });

  return (
    <div className={`recipient ${removed ? 'removed' : ''}`}>
      <button className="recipient-head" onClick={onToggle}>
        <span className={`chev ${open ? 'open' : ''}`}><Icon name="chevron" size={14} /></span>
        <b>{item.candidate.name}</b>
        <span className="muted small">{item.candidate.email}</span>
        {item.candidate.score != null && <span className="pill">score {item.candidate.score}</span>}
        <span className="grow" />
        {removed ? <span className="muted small">removed</span> : <MessageStates messages={item.messages} />}
      </button>

      {open && current && (
        <div className="recipient-body">
          <div className="chips tight">
            {item.messages.map((m) => (
              <button key={m.id} className={`chip ${m.stepIndex === current.stepIndex ? 'on' : ''}`} onClick={() => setStep(m.stepIndex)}>
                Step {m.stepIndex + 1} · Day {steps[m.stepIndex]?.dayOffset ?? 0}
              </button>
            ))}
          </div>
          <MessageEditor key={current.id} message={current} editable={editable && current.status === 'draft'} />
          {editable && drafts.length > 0 && (
            <button className="btn ghost sm danger" onClick={remove} disabled={busy}>Remove {item.candidate.name.split(' ')[0]} from this campaign</button>
          )}
        </div>
      )}
    </div>
  );
}

function MessageStates({ messages }: { messages: OutreachMessage[] }) {
  const sent = messages.filter((m) => m.status === 'sent').length;
  const waiting = messages.filter((m) => m.status === 'scheduled' || m.status === 'sending').length;
  const stopped = messages.filter((m) => ['cancelled', 'skipped'].includes(m.status)).length;
  const failed = messages.filter((m) => m.status === 'failed').length;
  return (
    <span className="msg-states small">
      {sent > 0 && <span className="ok-text">{sent} sent</span>}
      {waiting > 0 && (
        <span className="muted" title={messages.filter((m) => ['scheduled', 'sending'].includes(m.status) && m.note).map((m) => `Step ${m.stepIndex + 1}: ${m.note}`).join('\n') || undefined}>
          {waiting} scheduled
        </span>
      )}
      {stopped > 0 && (
        <span
          className="muted"
          title={messages.filter((m) => ['cancelled', 'skipped'].includes(m.status)).map((m) => `Step ${m.stepIndex + 1}: ${m.note || m.status}`).join('\n')}
        >
          {stopped} stopped
        </span>
      )}
      {failed > 0 && <span className="error-text">{failed} failed</span>}
    </span>
  );
}

function MessageEditor({ message, editable }: { message: OutreachMessage; editable: boolean }) {
  const [subject, setSubject] = useState(message.subject);
  const [body, setBody] = useState(message.body);
  const toast = useToast();
  const dirty = subject !== message.subject || body !== message.body;

  const save = async () => {
    if (!dirty) return;
    try {
      await api.patch(`/outreach/${message.id}`, { subject, body });
      toast('Draft saved', 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save');
    }
  };

  if (!editable) {
    return (
      <div className="email readonly">
        <div className="email-subject">{message.subject}</div>
        <pre>{message.body}</pre>
        <div className="muted small">
          {message.status === 'sent' && `Sent ${formatDate(message.sentAt)}`}
          {message.status === 'scheduled' && `Scheduled for ${formatDate(message.scheduledFor)}`}
          {message.status === 'cancelled' && `Stopped${message.note ? `: ${message.note}` : ''}`}
          {message.status === 'skipped' && `Skipped${message.note ? `: ${message.note}` : ''}`}
          {message.status === 'failed' && `Failed: ${message.error}`}
          {message.note && message.status === 'scheduled' && ` · ${message.note}`}
        </div>
      </div>
    );
  }

  return (
    <div className="email">
      <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={save} aria-label="Subject" />
      <textarea className="input" rows={10} value={body} onChange={(e) => setBody(e.target.value)} onBlur={save} aria-label="Body" />
      <div className="muted small">{dirty ? 'Unsaved changes, they save when you click away.' : 'The unsubscribe line is added automatically.'}</div>
    </div>
  );
}
