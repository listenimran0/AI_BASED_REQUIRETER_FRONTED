import { useState } from 'react';
import { campaignsApi } from '@/api';
import { type OutreachMessage } from '@/types';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/format';

export function MessageEditor({ message, editable }: { message: OutreachMessage; editable: boolean }) {
  const [subject, setSubject] = useState(message.subject);
  const [body, setBody] = useState(message.body);
  const toast = useToast();
  const dirty = subject !== message.subject || body !== message.body;

  const save = async () => {
    if (!dirty) return;
    try {
      await campaignsApi.updateDraft(message.id, { subject, body });
      toast('Draft saved', 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save');
    }
  };

  if (!editable) {
    return (
      <div className="email readonly">
        <div className="email-subject">{message.subject}</div>
        <pre>{message.body}</pre>
        <div className="muted small">
          {message.status === 'sent' && `Sent ${formatDate(message.sentAt)}`}
          {message.status === 'scheduled' && `Scheduled for ${formatDate(message.scheduledFor)}`}
          {message.status === 'cancelled' && `Stopped${message.note ? `: ${message.note}` : ''}`}
          {message.status === 'skipped' && `Skipped${message.note ? `: ${message.note}` : ''}`}
          {message.status === 'failed' && `Failed: ${message.error}`}
          {message.note && message.status === 'scheduled' && ` · ${message.note}`}
        </div>
      </div>
    );
  }

  return (
    <div className="email">
      <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={save} aria-label="Subject" />
      <textarea className="input" rows={10} value={body} onChange={(e) => setBody(e.target.value)} onBlur={save} aria-label="Body" />
      <div className="muted small">{dirty ? 'Unsaved changes, they save when you click away.' : 'The unsubscribe line is added automatically.'}</div>
    </div>
  );
}
