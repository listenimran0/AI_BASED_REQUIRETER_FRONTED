import { type OutreachMessage } from '@/types';

export function MessageStates({ messages }: { messages: OutreachMessage[] }) {
  const sent = messages.filter((m) => m.status === 'sent').length;
  const waiting = messages.filter((m) => m.status === 'scheduled' || m.status === 'sending').length;
  const stopped = messages.filter((m) => ['cancelled', 'skipped'].includes(m.status)).length;
  const failed = messages.filter((m) => m.status === 'failed').length;
  return (
    <span className="msg-states small">
      {sent > 0 && <span className="ok-text">{sent} sent</span>}
      {waiting > 0 && (
        <span
          className="muted"
          title={
            messages
              .filter((m) => ['scheduled', 'sending'].includes(m.status) && m.note)
              .map((m) => `Step ${m.stepIndex + 1}: ${m.note}`)
              .join('\n') || undefined
          }
        >
          {waiting} scheduled
        </span>
      )}
      {stopped > 0 && (
        <span
          className="muted"
          title={messages
            .filter((m) => ['cancelled', 'skipped'].includes(m.status))
            .map((m) => `Step ${m.stepIndex + 1}: ${m.note || m.status}`)
            .join('\n')}
        >
          {stopped} stopped
        </span>
      )}
      {failed > 0 && <span className="error-text">{failed} failed</span>}
    </span>
  );
}
