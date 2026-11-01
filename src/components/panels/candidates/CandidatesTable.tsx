import { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import { STATUS_LABEL, type Candidate, type Status } from '@/types';
import { Empty, Spinner } from '@/components/ui';
import { Row } from './CandidateRow';
import { ReplyModal } from './ReplyModal';
import { EmailModal } from './EmailModal';

type Props = { jobId: string; mode: 'review' | 'all'; status?: Status | null; limit?: number };

export function CandidatesTable({ jobId, mode, status, limit }: Props) {
  const [filter, setFilter] = useState<Status | 'all'>(status || 'all');
  const [query, setQuery] = useState('');
  const [replyFor, setReplyFor] = useState<Candidate | null>(null);
  const [emailFor, setEmailFor] = useState<Candidate | null>(null);

  const { data, error } = useLive(() => jobsApi.listCandidates(jobId), { jobId, entities: ['candidate', 'run'] }, [jobId]);

  if (error) return <div className="error-text">{error}</div>;
  if (!data)
    return (
      <div className="loading">
        <Spinner /> Loading candidates
      </div>
    );
  if (!data.length) return <Empty title="No candidates yet" hint="Start sourcing in the chat, or upload a CSV." />;

  const counts = data.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  let rows = data.filter((c) => (filter === 'all' ? true : c.status === filter));
  if (query.trim()) {
    const q = query.toLowerCase();
    rows = rows.filter((c) => [c.name, c.headline, c.email, c.company].some((v) => v?.toLowerCase().includes(q)));
  }
  const total = rows.length;
  if (limit) rows = rows.slice(0, limit);

  return (
    <div className="table-wrap">
      {mode === 'all' && (
        <div className="table-tools">
          <div className="chips">
            <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              All <span>{data.length}</span>
            </button>
            {(Object.keys(counts) as Status[]).map((s) => (
              <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
                {STATUS_LABEL[s]} <span>{counts[s]}</span>
              </button>
            ))}
          </div>
          <input className="search" placeholder="Search name, title, email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Score</th>
            <th>Why</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <Row key={c.id} c={c} onReply={() => setReplyFor(c)} onEmail={() => setEmailFor(c)} />
          ))}
        </tbody>
      </table>

      {limit && total > limit && (
        <div className="table-foot">
          Showing {limit} of {total}. <Link to={`/jobs/${jobId}`}>Open the full list</Link>
        </div>
      )}
      {!rows.length && <Empty title="No candidates match" />}
      {replyFor && <ReplyModal candidate={replyFor} onClose={() => setReplyFor(null)} />}
      {emailFor && <EmailModal candidate={emailFor} onClose={() => setEmailFor(null)} />}
    </div>
  );
}
