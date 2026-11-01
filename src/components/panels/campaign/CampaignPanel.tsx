import { useState } from 'react';
import { campaignsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import { Empty, Icon, Spinner } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { Recipient } from './Recipient';

const STATE_LABEL: Record<string, string> = {
  drafting: 'Drafting',
  ready: 'Ready for approval',
  active: 'Sending',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
};

export function CampaignPanel({ campaignId }: { campaignId: string }) {
  const { data, error, reload } = useLive(() => campaignsApi.getCampaign(campaignId), { id: campaignId, entities: ['campaign'] }, [campaignId]);
  const { busy, run } = useAction();
  const [open, setOpen] = useState<string | null>(null);

  if (error) return <div className="error-text">{error}</div>;
  if (!data)
    return (
      <div className="loading">
        <Spinner /> Loading campaign
      </div>
    );

  const { campaign, items, progress } = data;
  const drafts = items.reduce((n, i) => n + i.messages.filter((m) => m.status === 'draft').length, 0);
  const totalEmails = items.reduce((n, i) => n + i.messages.length, 0);
  const sentEmails = items.reduce((n, i) => n + i.messages.filter((m) => m.status === 'sent').length, 0);

  const call = (action: 'approve' | 'pause' | 'resume') =>
    run(async () => {
      await campaignsApi.campaignAction(campaignId, action);
      await reload();
    });

  return (
    <div className="campaign">
      <div className="campaign-head">
        <div>
          <b>{campaign.name}</b>
          <div className="steps-line">
            {campaign.steps.map((s, i) => (
              <span key={i} className="step-pill" title={s.goal}>
                Day {s.dayOffset}
              </span>
            ))}
            <span className="muted small">· up to {campaign.dailyLimit} sends per day</span>
          </div>
        </div>
        <span className={`badge camp-${campaign.status}`}>{STATE_LABEL[campaign.status]}</span>
      </div>

      {campaign.status === 'drafting' && (
        <div className="progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(progress.drafted / Math.max(1, progress.total)) * 100}%` }} />
          </div>
          <span className="small muted">
            <Spinner size={12} /> Drafted {progress.drafted} of {progress.total}
            {progress.failed ? `, ${progress.failed} failed` : ''}
          </span>
        </div>
      )}

      {['active', 'paused', 'completed'].includes(campaign.status) && (
        <div className="progress">
          <div className="progress-track">
            <div className="progress-fill ok" style={{ width: `${(sentEmails / Math.max(1, totalEmails)) * 100}%` }} />
          </div>
          <span className="small muted">
            {sentEmails} of {totalEmails} emails sent
          </span>
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
            <button className="btn primary" disabled={busy || !drafts} onClick={() => call('approve')}>
              {busy ? <Spinner /> : <Icon name="send" />} Approve and send {drafts} emails
            </button>
          </>
        )}
        {campaign.status === 'active' && (
          <button className="btn ghost" disabled={busy} onClick={() => call('pause')}>
            <Icon name="pause" /> Pause campaign
          </button>
        )}
        {campaign.status === 'paused' && (
          <button className="btn primary" disabled={busy} onClick={() => call('resume')}>
            <Icon name="play" /> Resume campaign
          </button>
        )}
      </div>
    </div>
  );
}
