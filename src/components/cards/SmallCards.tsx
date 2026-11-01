import { jobsApi, runsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import type { Job, Run } from '@/types';
import { Icon, Spinner } from '@/components/ui';

export function RunCard({ runId }: { runId: string }) {
  const { data: run } = useLive(() => runsApi.getRun(runId), { id: runId, entities: ['run'] }, [runId]);
  if (!run)
    return (
      <div className="card loading">
        <Spinner /> Loading
      </div>
    );

  const active = ['queued', 'searching', 'scoring'].includes(run.status);
  const label =
    run.status === 'queued'
      ? 'Waiting to start'
      : run.status === 'searching'
        ? 'Searching the web'
        : run.status === 'scoring'
          ? 'Scoring candidates'
          : run.status === 'done'
            ? 'Finished'
            : 'Failed';
  const done = run.scored + run.failed;

  return (
    <div className="card run">
      <div className="card-head">
        <span className="card-icon">{active ? <Spinner /> : <Icon name={run.status === 'done' ? 'check' : 'warn'} />}</span>
        <div>
          <b>
            {run.kind === 'csv' ? 'CSV import' : 'Sourcing'}: {label}
          </b>
          <div className="muted small">
            Found {run.found}
            {run.status === 'searching' && run.kind === 'web' ? ` of about ${run.target}` : ''} · scored {run.scored}
            {run.failed > 0 && ` · ${run.failed} failed`}
            {run.duplicates > 0 && ` · ${run.duplicates} duplicates skipped`}
          </div>
        </div>
      </div>
      {run.found > 0 && (
        <div className="progress">
          <div className="progress-track">
            <div className={`progress-fill ${run.status === 'done' ? 'ok' : ''}`} style={{ width: `${(done / run.found) * 100}%` }} />
          </div>
        </div>
      )}
      {run.note && <div className="muted small">{run.note}</div>}
      {run.error && <div className="error-text small">{run.error}</div>}
    </div>
  );
}

export function JobCard({ jobId }: { jobId: string }) {
  const { data: job } = useLive(() => jobsApi.getJob(jobId), { jobId, entities: ['job'] }, [jobId]);
  if (!job)
    return (
      <div className="card loading">
        <Spinner /> Loading
      </div>
    );

  const salary = job.salary?.text || [job.salary?.currency, job.salary?.min, job.salary?.max].filter(Boolean).join(' ');
  return (
    <div className="card job">
      <div className="card-head">
        <span className="card-icon">
          <Icon name="users" />
        </span>
        <div>
          <b>{job.title}</b>
          <div className="muted small">
            {[job.seniority, job.location, job.remotePolicy !== 'unknown' ? job.remotePolicy : null, salary].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
      <div className="skill-row">
        {job.mustHaveSkills.map((s) => (
          <span key={s} className="skill yes">
            {s}
          </span>
        ))}
        {job.niceToHaveSkills.map((s) => (
          <span key={s} className="skill">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
