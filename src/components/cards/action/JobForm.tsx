import { useState } from 'react';
import { TagInput } from '@/components/ui';
import { Footer } from './ActionFooter';
import { Field } from './ActionField';
import { type BodyProps } from './types';

export function JobForm({ action, busy, onConfirm, onCancel }: BodyProps) {
  const p = action.payload;
  const [form, setForm] = useState({
    title: p.title || '',
    seniority: p.seniority || '',
    location: p.location || '',
    remotePolicy: p.remotePolicy || 'unknown',
    salaryText: p.salaryText || '',
    mustHaveSkills: (p.mustHaveSkills || []) as string[],
    niceToHaveSkills: (p.niceToHaveSkills || []) as string[],
    summary: p.summary || '',
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () =>
    onConfirm({
      ...form,
      // empty strings would fail validation, so leave them out
      seniority: form.seniority || undefined,
      location: form.location || undefined,
      salaryText: form.salaryText || undefined,
      summary: form.summary || undefined,
    });

  return (
    <>
      <div className="form-grid">
        <Field label="Job title" wide>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Seniority">
          <input className="input" value={form.seniority} onChange={(e) => set('seniority', e.target.value)} placeholder="not stated" />
        </Field>
        <Field label="Location">
          <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="not stated" />
        </Field>
        <Field label="Remote policy">
          <select className="input" value={form.remotePolicy} onChange={(e) => set('remotePolicy', e.target.value)}>
            <option value="unknown">Not stated</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </Field>
        <Field label="Salary">
          <input className="input" value={form.salaryText} onChange={(e) => set('salaryText', e.target.value)} placeholder="not stated" />
        </Field>
        <Field label="Must-have skills" wide>
          <TagInput value={form.mustHaveSkills} onChange={(v) => set('mustHaveSkills', v)} placeholder="Type a skill and press Enter" />
        </Field>
        <Field label="Nice-to-have skills" wide>
          <TagInput value={form.niceToHaveSkills} onChange={(v) => set('niceToHaveSkills', v)} placeholder="Type a skill and press Enter" />
        </Field>
        <Field label="Summary" wide>
          <textarea className="input" rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </Field>
      </div>
      <Footer busy={busy} label="Confirm and create job" onConfirm={submit} onCancel={onCancel} disabled={form.title.trim().length < 2} />
    </>
  );
}
