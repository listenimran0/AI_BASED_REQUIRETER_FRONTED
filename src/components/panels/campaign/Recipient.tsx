import { useState } from 'react';
import { campaignsApi } from '@/api';
import { type CampaignDetail } from '@/types';
import { Icon } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { MessageStates } from './MessageStates';
import { MessageEditor } from './MessageEditor';

type Item = CampaignDetail['items'][number];

export function Recipient({
  item,
  steps,
  open,
  onToggle,
  editable,
}: {
  item: Item;
  steps: { dayOffset: number; goal: string }[];
  open: boolean;
  onToggle: () => void;
  editable: boolean;
}) {
  const [step, setStep] = useState(0);
  const { busy, run } = useAction();
  const drafts = item.messages.filter((m) => m.status === 'draft');
  const current = item.messages.find((m) => m.stepIndex === step) || item.messages[0];
  const removed = item.messages.length > 0 && item.messages.every((m) => m.status === 'cancelled');

  const remove = () =>
    run(async () => {
      for (const d of drafts) await campaignsApi.skipDraft(d.id);
    });

  return (
    <div className={`recipient ${removed ? 'removed' : ''}`}>
      <button className="recipient-head" onClick={onToggle}>
        <span className={`chev ${open ? 'open' : ''}`}>
          <Icon name="chevron" size={14} />
        </span>
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
            <button className="btn ghost sm danger" onClick={remove} disabled={busy}>
              Remove {item.candidate.name.split(' ')[0]} from this campaign
            </button>
          )}
        </div>
      )}
    </div>
  );
}
