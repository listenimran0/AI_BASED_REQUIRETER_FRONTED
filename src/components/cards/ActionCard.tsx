import { useState, type ReactNode } from 'react';
import { api } from '../../api';
import { useLive } from '../../events';
import { STATUS_LABEL, type ActionDoc, type Status } from '../../types';
import { Icon, Spinner, TagInput, useAction } from '../../ui';

const ICON: Record<string, string> = {
  create_job: 'edit',
  start_sourcing: 'users',
  update_status: 'check',
  create_campaign: 'mail',
  approve_campaign: 'send',
  campaign_control: 'pause',
  set_auto_reply: 'bolt',
};

export function ActionCard({ actionId }: { actionId: string }) {
  const { data: action, error } = useLive(() => api.get<ActionDoc>(`/actions/${actionId}`), { id: actionId, entities: ['action'] }, [actionId]);
  const { busy, run } = useAction();

  if (error) return <div className="card error-text">{error}</div>;
  if (!action) return <div className="card loading"><Spinner /> Loading</div>;

  const confirm = (payload?: Record<string, unknown>) => run(() => api.post(`/actions/${actionId}/confirm`, payload ? { payload } : {}));
  const cancel = () => run(() => api.post(`/actions/${actionId}/cancel`));

  if (action.status !== 'pending') return <Finished action={action} />;

  return (
    <div className="card action">
      <div className="card-head">
        <span className="card-icon"><Icon name={ICON[action.type] || 'bolt'} /></span>
        <div>
          <b>{action.title}</b>
          <div className="muted small">The AI proposed this. Nothing happens until you confirm.</div>
        </div>
      </div>
      <Body action={action} busy={busy} onConfirm={confirm} onCancel={cancel} />
    </div>
  );
}

function Finished({ action }: { action: ActionDoc }) {
  const tone = action.status === 'done' ? 'done' : action.status === 'failed' ? 'failed' : 'muted';
  return (
    <div className={`card action finished ${tone}`}>
      <span className="card-icon">
        {action.status === 'running' ? <Spinner /> : <Icon name={action.status === 'done' ? 'check' : 'x'} />}
      </span>
      <div>
        <b>{action.title}</b>
        <div className="muted small">
          {action.status === 'done' && 'Confirmed and done'}
          {action.status === 'running' && 'Working on it…'}
          {action.status === 'cancelled' && 'Cancelled, nothing was changed'}
          {action.status === 'failed' && `Failed: ${action.error}. Ask me to try again.`}
        </div>
      </div>
    </div>
  );
}

type BodyProps = {
  action: ActionDoc;
  busy: boolean;
  onConfirm: (payload?: Record<string, unknown>) => void;
  onCancel: () => void;
};

function Footer({ busy, label, onConfirm, onCancel, disabled }: { busy: boolean; label: string; onConfirm: () => void; onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="card-foot">
      <button className="btn ghost" onClick={onCancel} disabled={busy}>Cancel</button>
      <button className="btn primary" onClick={onConfirm} disabled={busy || disabled}>
        {busy ? <Spinner /> : <Icon name="check" />} {label}
      </button>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Body(props: BodyProps) {
  switch (props.action.type) {
    case 'create_job':
      return <JobForm {...props} />;
    case 'start_sourcing':
      return <SourcingForm {...props} />;
    case 'update_status':
      return <StatusPreview {...props} />;
    case 'create_campaign':
      return <CampaignForm {...props} />;
    case 'approve_campaign':
      return (
        <>
          <p className="card-text">
            This will schedule <b>{props.action.payload.drafts}</b> emails for “{props.action.payload.name}”. The first step goes out right away (within the daily limit),
            follow-ups go out on their days, and anyone who replies or unsubscribes is dropped from the sequence.
          </p>
          <Footer busy={props.busy} label="Approve and send" onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />
        </>
      );
    case 'campaign_control':
      return (
        <>
          <p className="card-text">
            {props.action.payload.action === 'pause' ? 'Nothing more will be sent until you resume.' : 'Sending continues from where it stopped.'}
          </p>
          <Footer busy={props.busy} label={props.action.payload.action === 'pause' ? 'Pause' : 'Resume'} onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />
        </>
      );
    case 'set_auto_reply':
      return (
        <>
          <p className="card-text">
            {props.action.payload.enabled
              ? 'The AI will answer by itself only when a reply is a confident “interested” or “wants a meeting”, has no instruction-like text, and the draft does not mention money or promises. Everything else waits for you.'
              : 'Every reply draft will wait for your approval.'}
          </p>
          <Footer busy={props.busy} label={props.action.payload.enabled ? 'Turn on' : 'Turn off'} onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />
        </>
      );
    default:
      return <Footer busy={props.busy} label="Confirm" onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />;
  }
}

function JobForm({ action, busy, onConfirm, onCancel }: BodyProps) {
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
        <Field label="Job title" wide><input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Seniority"><input className="input" value={form.seniority} onChange={(e) => set('seniority', e.target.value)} placeholder="not stated" /></Field>
        <Field label="Location"><input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="not stated" /></Field>
        <Field label="Remote policy">
          <select className="input" value={form.remotePolicy} onChange={(e) => set('remotePolicy', e.target.value)}>
            <option value="unknown">Not stated</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </Field>
        <Field label="Salary"><input className="input" value={form.salaryText} onChange={(e) => set('salaryText', e.target.value)} placeholder="not stated" /></Field>
        <Field label="Must-have skills" wide><TagInput value={form.mustHaveSkills} onChange={(v) => set('mustHaveSkills', v)} placeholder="Type a skill and press Enter" /></Field>
        <Field label="Nice-to-have skills" wide><TagInput value={form.niceToHaveSkills} onChange={(v) => set('niceToHaveSkills', v)} placeholder="Type a skill and press Enter" /></Field>
        <Field label="Summary" wide><textarea className="input" rows={3} value={form.summary} onChange={(e) => set('summary', e.target.value)} /></Field>
      </div>
      <Footer busy={busy} label="Confirm and create job" onConfirm={submit} onCancel={onCancel} disabled={form.title.trim().length < 2} />
    </>
  );
}

function SourcingForm({ action, busy, onConfirm, onCancel }: BodyProps) {
  const [target, setTarget] = useState<number>(action.payload.target || 30);
  return (
    <>
      <p className="card-text">
        I will search the public web for LinkedIn profiles that match <b>{action.payload.jobTitle}</b> (no direct LinkedIn scraping), remove duplicates, and score each
        candidate from 0 to 100 with a short reason. It runs in the background and you can keep chatting.
      </p>
      <Field label="How many candidates to look for">
        <input className="input narrow" type="number" min={5} max={100} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
      </Field>
      <Footer busy={busy} label="Start sourcing" onConfirm={() => onConfirm({ target })} onCancel={onCancel} disabled={target < 5 || target > 100} />
    </>
  );
}

function StatusPreview({ action, busy, onConfirm, onCancel }: BodyProps) {
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
            <span className="muted small">{STATUS_LABEL[c.from]} → {STATUS_LABEL[p.status as Status]}</span>
          </li>
        ))}
      </ul>
      {blocked.length > 0 && (
        <div className="muted small">Left out: {blocked.map((b) => `${b.name} (${b.reason})`).join('; ')}</div>
      )}
      <Footer busy={busy} label={`Mark ${preview.length} as ${STATUS_LABEL[p.status as Status]}`} onConfirm={() => onConfirm()} onCancel={onCancel} />
    </>
  );
}

type Step = { dayOffset: number; goal: string };

function CampaignForm({ action, busy, onConfirm, onCancel }: BodyProps) {
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
        <Field label="Campaign name" wide><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Daily send limit"><input className="input" type="number" min={1} value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} /></Field>
        <Field label="Tone"><input className="input" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="warm and professional" /></Field>
      </div>

      <div className="field-label">Emails in the sequence</div>
      {steps.map((s, i) => (
        <div className="step-row" key={i}>
          <span className="step-no">{i + 1}</span>
          <label className="day">
            Day <input className="input" type="number" min={0} max={60} value={s.dayOffset} onChange={(e) => setStep(i, { dayOffset: Number(e.target.value) })} />
          </label>
          <input className="input" value={s.goal} onChange={(e) => setStep(i, { goal: e.target.value })} aria-label="What this email should do" />
          {steps.length > 1 && (
            <button className="icon-btn" onClick={() => setSteps((l) => l.filter((_, idx) => idx !== i))} aria-label="Remove step"><Icon name="x" /></button>
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
