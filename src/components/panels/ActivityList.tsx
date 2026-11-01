import { api } from '../../api';
import { useLive } from '../../events';
import type { Activity } from '../../types';
import { Empty, Spinner, formatDate } from '../../ui';

const ACTOR: Record<string, string> = {
  'recruiter:ui': 'Recruiter (UI)',
  'recruiter:chat': 'Recruiter (chat)',
  candidate: 'Candidate',
  system: 'System',
  ai: 'AI',
};

export function ActivityList({ jobId, limit = 60 }: { jobId: string; limit?: number }) {
  const { data } = useLive(() => api.get<Activity[]>(`/jobs/${jobId}/activity?limit=${limit}`), { jobId, entities: ['activity'] }, [jobId]);
  if (!data) return <div className="loading"><Spinner /> Loading activity</div>;
  if (!data.length) return <Empty title="Nothing has happened yet" />;

  return (
    <ul className="activity">
      {data.map((a) => (
        <li key={a.id}>
          <span className={`dot actor-${a.actor.split(':')[0]}`} />
          <div>
            <div>{a.message}</div>
            <div className="muted small">
              {ACTOR[a.actor] || a.actor} · {formatDate(a.createdAt)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
