import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jobsApi } from '@/api';
import { ActivityList } from '@/components/panels/ActivityList';
import { CampaignPanel } from '@/components/panels/campaign';
import { CandidatesTable } from '@/components/panels/candidates';
import { RepliesPanel } from '@/components/panels/RepliesPanel';
import { StatsPanel } from '@/components/panels/StatsPanel';
import { useLive } from '@/hooks/useLive';
import type { Campaign, Job } from '@/types';
import { Empty, Icon, Spinner } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { useToast } from '@/context/ToastContext';

const TABS = ['Overview', 'Candidates', 'Outreach', 'Replies', 'Activity'] as const;

export function JobPage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const { data: job, error, reload } = useLive(() => jobsApi.getJob(id), { jobId: id, entities: ['job'] }, [id]);
  const { data: campaigns } = useLive(() => jobsApi.listCampaigns(id), { jobId: id, entities: ['campaign'] }, [id]);
  const { busy, run } = useAction();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  if (error)
    return (
      <div className="page">
        <div className="error-text">{error}</div>
      </div>
    );
  if (!job)
    return (
      <div className="page">
        <div className="loading">
          <Spinner /> Loading job
        </div>
      </div>
    );

  const toggleAuto = () =>
    run(async () => {
      await jobsApi.setAutoReply(id, !job.autoReply);
      await reload();
    });

  const upload = async (file?: File) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const result = await jobsApi.uploadCandidatesCsv(id, form);
      toast(`Added ${result.added}, ${result.duplicates} duplicates, ${result.skipped.length} skipped`, 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const salary = job.salary?.text || [job.salary?.currency, job.salary?.min, job.salary?.max].filter(Boolean).join(' ');

  return (
    <div className="page wide">
      <Link to="/dashboard" className="back muted small">
        ← All jobs
      </Link>
      <header className="page-head">
        <div>
          <h1>{job.title}</h1>
          <p className="muted">
            {[job.seniority, job.location, job.remotePolicy !== 'unknown' ? job.remotePolicy : null, salary].filter(Boolean).join(' · ') || 'No extra details'}
          </p>
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
        <div className="head-actions col">
          <label className="switch" title="When on, the AI answers confident interested / meeting replies by itself if the safety checks pass">
            <input type="checkbox" checked={job.autoReply} disabled={busy} onChange={toggleAuto} />
            <span className="track" />
            Auto-reply
          </label>
          <button className="btn ghost sm" onClick={() => fileInput.current?.click()}>
            <Icon name="clip" size={14} /> Upload CSV
          </button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </div>
      </header>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="stack">
          <div className="card">
            <StatsPanel jobId={id} />
          </div>
          <div className="card">
            <h3>Recent activity</h3>
            <ActivityList jobId={id} limit={8} />
          </div>
        </div>
      )}
      {tab === 'Candidates' && (
        <div className="card flush">
          <CandidatesTable jobId={id} mode="all" />
        </div>
      )}
      {tab === 'Outreach' && (
        <div className="stack">
          {campaigns?.length ? (
            campaigns.map((c) => (
              <div className="card" key={c.id}>
                <CampaignPanel campaignId={c.id} />
              </div>
            ))
          ) : (
            <div className="card">
              <Empty title="No campaigns yet" hint="Accept some candidates, then ask the AI in chat to create an outreach campaign." />
            </div>
          )}
        </div>
      )}
      {tab === 'Replies' && (
        <div className="card">
          <RepliesPanel jobId={id} />
        </div>
      )}
      {tab === 'Activity' && (
        <div className="card">
          <ActivityList jobId={id} limit={200} />
        </div>
      )}
    </div>
  );
}
