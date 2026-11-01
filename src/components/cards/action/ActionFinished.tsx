import { type ActionDoc } from '@/types';
import { Icon, Spinner } from '@/components/ui';

export function Finished({ action }: { action: ActionDoc }) {
  const tone = action.status === 'done' ? 'done' : action.status === 'failed' ? 'failed' : 'muted';
  return (
    <div className={`card action finished ${tone}`}>
      <span className="card-icon">{action.status === 'running' ? <Spinner /> : <Icon name={action.status === 'done' ? 'check' : 'x'} />}</span>
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
