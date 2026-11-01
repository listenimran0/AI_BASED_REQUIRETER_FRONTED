import { useState } from 'react';
import { Footer } from './ActionFooter';
import { Field } from './ActionField';
import { type BodyProps } from './types';

export function SourcingForm({ action, busy, onConfirm, onCancel }: BodyProps) {
  const [target, setTarget] = useState<number>(action.payload.target || 30);
  return (
    <>
      <p className="card-text">
        I will search the public web for LinkedIn profiles that match <b>{action.payload.jobTitle}</b> (no direct LinkedIn scraping), remove duplicates, and
        score each candidate from 0 to 100 with a short reason. It runs in the background and you can keep chatting.
      </p>
      <Field label="How many candidates to look for">
        <input className="input narrow" type="number" min={5} max={100} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
      </Field>
      <Footer busy={busy} label="Start sourcing" onConfirm={() => onConfirm({ target })} onCancel={onCancel} disabled={target < 5 || target > 100} />
    </>
  );
}
