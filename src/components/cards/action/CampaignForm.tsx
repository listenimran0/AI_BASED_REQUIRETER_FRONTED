import { useState } from 'react';
import { Icon } from '@/components/ui';
import { Footer } from './ActionFooter';
import { Field } from './ActionField';
import { type BodyProps } from './types';

type Step = { dayOffset: number; goal: string };

export function CampaignForm({ action, busy, onConfirm, onCancel }: BodyProps) {
  const p = action.payload;
  const people = (p.preview || []) as { name: string; email: string }[];
  const ids = (p.candidateIds || []) as string[];
  const [name, setName] = useState<string>(p.name);
  const [steps, setSteps] = useState<Step[]>(p.steps);
  const [dailyLimit, setDailyLimit] = useState<number>(p.dailyLimit || 20);
  const [tone, setTone] = useState<string>(p.tone || '');
  const [chosen, setChosen] = useState<string[]>(ids);

  const setStep = (i: number, patch: Partial<Step>) => setSteps((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const excluded = (p.excluded || []) as string[];

  return (
    <>
      <div className="form-grid">
        <Field label="Campaign name" wide>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Daily send limit">
          <input className="input" type="number" min={1} value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} />
        </Field>
        <Field label="Tone">
          <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="warm and professional" />
        </Field>
      </div>

      <div className="field-label">Emails in the sequence</div>
      {steps.map((s, i) => (
        <div className="step-row" key={i}>
          <span className="step-no">{i + 1}</span>
          <label className="day">
            Day{' '}
            <input className="input" type="number" min={0} max={60} value={s.dayOffset} onChange={(e) => setStep(i, { dayOffset: Number(e.target.value) })} />
          </label>
          <input className="input" value={s.goal} onChange={(e) => setStep(i, { goal: e.target.value })} aria-label="What this email should do" />
          {steps.length > 1 && (
            <button className="icon-btn" onClick={() => setSteps((l) => l.filter((_, idx) => idx !== i))} aria-label="Remove step">
              <Icon name="x" />
            </button>
          )}
        </div>
      ))}
      {steps.length < 5 && (
        <button className="btn ghost sm" onClick={() => setSteps((l) => [...l, { dayOffset: (l[l.length - 1]?.dayOffset ?? 0) + 3, goal: 'Short follow-up' }])}>
          <Icon name="plus" size={14} /> Add a follow-up
        </button>
      )}

      <div className="field-label">Recipients ({chosen.length})</div>
      <ul className="preview-list checks">
        {people.map((c, i) => (
          <li key={ids[i]}>
            <label>
              <input
                type="checkbox"
                checked={chosen.includes(ids[i])}
                onChange={(e) => setChosen((list) => (e.target.checked ? [...list, ids[i]] : list.filter((x) => x !== ids[i])))}
              />
              <b>{c.name}</b>
              <span className="muted small">{c.email}</span>
            </label>
          </li>
        ))}
      </ul>
      {excluded.length > 0 && <div className="muted small">Not included because they have no email: {excluded.join(', ')}</div>}

      <Footer
        busy={busy}
        label="Write the drafts"
        onConfirm={() => onConfirm({ name, steps, dailyLimit, tone: tone || undefined, candidateIds: chosen })}
        onCancel={onCancel}
        disabled={!chosen.length || !steps.length || name.trim().length < 2}
      />
    </>
  );
}
