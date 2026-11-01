import { actionsApi } from '@/api';
import { useLive } from '@/hooks/useLive';
import { Icon, Spinner } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { Finished } from './ActionFinished';
import { Body } from './ActionBody';

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
  const { data: action, error } = useLive(() => actionsApi.getAction(actionId), { id: actionId, entities: ['action'] }, [actionId]);
  const { busy, run } = useAction();

  if (error) return <div className="card error-text">{error}</div>;
  if (!action)
    return (
      <div className="card loading">
        <Spinner /> Loading
      </div>
    );

  const confirm = (payload?: Record<string, unknown>) => run(() => actionsApi.confirmAction(actionId, payload));
  const cancel = () => run(() => actionsApi.cancelAction(actionId));

  if (action.status !== 'pending') return <Finished action={action} />;

  return (
    <div className="card action">
      <div className="card-head">
        <span className="card-icon">
          <Icon name={ICON[action.type] || 'bolt'} />
        </span>
        <div>
          <b>{action.title}</b>
          <div className="muted small">The AI proposed this. Nothing happens until you confirm.</div>
        </div>
      </div>
      <Body action={action} busy={busy} onConfirm={confirm} onCancel={cancel} />
    </div>
  );
}
