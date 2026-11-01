import { useState } from 'react';
import { api } from '../../api';
import { useLive } from '../../events';
import type { JobStats } from '../../types';
import { Icon, Spinner, pct, useAction } from '../../ui';

export function StatsPanel({ jobId, compact }: { jobId: string; compact?: boolean }) {
  const { data: stats, error } = useLive(
    () => api.get<JobStats>(`/jobs/${jobId}/stats`),
    { jobId, entities: ['candidate', 'campaign', 'reply', 'run'] },
    [jobId],
  );
  const [summary, setSummary] = useState('');
  const { busy, run } = useAction();

  if (error) return <div className="error-text">{error}</div>;
  if (!stats) return <div className="loading"><Spinner /> Loading stats</div>;

  const top = Math.max(1, stats.funnel[0].reached);

  const loadSummary = async () => {
    const result = await run(() => api.get<{ summary: string }>(`/jobs/${jobId}/summary`));
    if (result) setSummary(result.summary);
  };

  return (
    <div className="stats">
      <div className="kpis">
        <Kpi label="Candidates" value={stats.totalCandidates} />
        <Kpi label="Emails sent" value={stats.emailsSent} />
        <Kpi label="Reply rate" value={pct(stats.replyRate)} hint={`${stats.funnel[3].reached} of ${stats.funnel[2].reached} contacted`} />
        <Kpi label="Interested rate" value={pct(stats.interestedRate)} hint={`${stats.funnel[4].reached} interested`} />
        <Kpi label="Meetings" value={stats.meetings} />
        <Kpi label="Hired" value={stats.hires} accent />
      </div>

      <div className="funnel">
        {stats.funnel.map((f) => (
          <div className="funnel-row" key={f.status}>
            <span className="funnel-label">{f.label}</span>
            <div className="funnel-track">
              <div className={`funnel-fill st-bg-${f.status}`} style={{ width: `${Math.max(f.reached ? 3 : 0, (f.reached / top) * 100)}%` }} />
            </div>
            <b className="funnel-count">{f.reached}</b>
          </div>
        ))}
      </div>

      <div className="stats-foot">
        <span className="muted small">
          Also: {stats.rejected} rejected, {stats.notInterested} not interested, {stats.unsubscribed} unsubscribed
          {stats.pendingReplyDrafts > 0 && ` · ${stats.pendingReplyDrafts} reply draft${stats.pendingReplyDrafts > 1 ? 's' : ''} waiting`}
        </span>
        <span className="muted small" title={`${stats.cost.promptTokens} prompt and ${stats.cost.completionTokens} completion tokens over ${stats.cost.calls} calls`}>
          AI usage: {(stats.cost.promptTokens + stats.cost.completionTokens).toLocaleString()} tokens · ${stats.cost.usd.toFixed(4)}
        </span>
      </div>

      {!compact && (
        <div className="summary-box">
          <button className="btn ghost sm" onClick={loadSummary} disabled={busy}>
            {busy ? <Spinner /> : <Icon name="sparkle" size={14} />} AI summary
          </button>
          {summary && <p>{summary}</p>}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <div className={`kpi ${accent ? 'accent' : ''}`}>
      <span className="kpi-label">{label}</span>
      <b className="kpi-value">{value}</b>
      {hint && <span className="kpi-hint">{hint}</span>}
    </div>
  );
}
