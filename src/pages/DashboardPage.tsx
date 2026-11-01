import { Link } from 'react-router-dom';
import { jobsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import type { Job, JobStats } from '@/types';
import { Empty, Icon, Spinner } from '@/components/ui';
import { pct } from '@/lib/format';

type JobWithStats = Job & { stats: JobStats };

export function DashboardPage() {
  const { data: jobs, error } = useLive(() => jobsApi.listJobs<JobWithStats>(), { entities: ['candidate', 'campaign', 'reply', 'job'] }, []);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Every job and how its hiring funnel is doing.</p>
        </div>
      </header>

      {error && <div className="error-text">{error}</div>}
      {!jobs && !error && (
        <div className="loading">
          <Spinner /> Loading jobs
        </div>
      )}
      {jobs && !jobs.length && (
        <div className="card">
          <Empty title="No jobs yet" hint="Start a chat, paste a job description and the AI will set everything up." />
          <div className="center pad">
            <Link className="btn primary" to="/">
              <Icon name="chat" /> Open the chat
            </Link>
          </div>
        </div>
      )}

      <div className="job-grid">
        {jobs?.map((job) => {
          const f = Object.fromEntries(job.stats.funnel.map((x) => [x.status, x.reached]));
          return (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card job-tile">
              <div className="tile-head">
                <b>{job.title}</b>
                <span className="muted small">{[job.seniority, job.location].filter(Boolean).join(' · ')}</span>
              </div>
              <div className="tile-stats">
                <Stat label="Candidates" value={job.stats.totalCandidates} />
                <Stat label="Contacted" value={f.contacted} />
                <Stat label="Reply rate" value={pct(job.stats.replyRate)} />
                <Stat label="Meetings" value={job.stats.meetings} />
                <Stat label="Hired" value={job.stats.hires} accent />
              </div>
              <div className="mini-funnel">
                {job.stats.funnel.map((x) => (
                  <span key={x.status} className={`st-bg-${x.status}`} style={{ flex: Math.max(x.reached, 0.2) }} title={`${x.label}: ${x.reached}`} />
                ))}
              </div>
              {job.stats.pendingReplyDrafts > 0 && <div className="pill warn">{job.stats.pendingReplyDrafts} reply draft(s) waiting</div>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`stat ${accent ? 'accent' : ''}`}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
