import ReactMarkdown from 'react-markdown';
import type { CardRef, ChatMessage } from '@/types';
import { Icon } from '@/components/ui';
import { ActionCard } from '@/components/cards/action';
import { JobCard, RunCard } from '@/components/cards/SmallCards';
import { CampaignPanel } from '@/components/panels/campaign';
import { CandidatesTable } from '@/components/panels/candidates';
import { RepliesPanel } from '@/components/panels/RepliesPanel';
import { StatsPanel } from '@/components/panels/StatsPanel';

function Card({ card }: { card: CardRef }) {
  const { type, ref } = card;
  switch (type) {
    case 'action':
      return <ActionCard actionId={ref.actionId} />;
    case 'job':
      return <JobCard jobId={ref.jobId} />;
    case 'run':
      return <RunCard runId={ref.runId} />;
    case 'candidates':
      return (
        <div className="card flush">
          <CandidatesTable jobId={ref.jobId} mode="review" status={ref.status} limit={10} />
        </div>
      );
    case 'campaign':
      return (
        <div className="card">
          <CampaignPanel campaignId={ref.campaignId} />
        </div>
      );
    case 'replies':
      return (
        <div className="card">
          <RepliesPanel jobId={ref.jobId} replyId={ref.replyId} pendingOnly={!ref.replyId} />
        </div>
      );
    case 'stats':
      return (
        <div className="card">
          <StatsPanel jobId={ref.jobId} compact />
        </div>
      );
    default:
      return null;
  }
}

export function Message({ message, onSuggest, canSuggest }: { message: ChatMessage; onSuggest: (text: string) => void; canSuggest: boolean }) {
  if (message.role === 'user') {
    return (
      <div className="msg user">
        <div className="bubble">{message.content.length > 600 ? `${message.content.slice(0, 600)}…` : message.content}</div>
      </div>
    );
  }

  const suggestions = message.cards.filter((c) => c.type === 'suggestions').flatMap((c) => c.ref.items as string[]);
  const cards = message.cards.filter((c) => c.type !== 'suggestions');

  return (
    <div className="msg assistant">
      <div className="avatar">
        <Icon name="sparkle" size={15} />
      </div>
      <div className="msg-body">
        {message.content && (
          <div className="bubble">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {cards.map((card, i) => (
          <Card key={`${card.type}-${i}`} card={card} />
        ))}
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s) => (
              <button key={s} className="chip suggest" disabled={!canSuggest} onClick={() => onSuggest(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
