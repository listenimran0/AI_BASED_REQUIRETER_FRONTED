import { useState } from 'react';
import { candidatesApi } from '@/api';
import { type Candidate } from '@/types';
import { Icon, Modal, Spinner } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { useToast } from '@/context/ToastContext';

const REPLY_PRESETS = [
  { label: 'Interested', text: 'Thanks for reaching out, this sounds interesting. Could you tell me a bit more about the role?' },
  { label: 'Wants a meeting', text: 'This looks like a great fit. I would love to talk, are you free for a call this week?' },
  { label: 'Question', text: 'Thanks for the note. Is the position fully remote, and what does the interview process look like?' },
  { label: 'Not interested', text: 'Thank you, but I am happy where I am and not looking right now.' },
  { label: 'Unsubscribe', text: 'Please unsubscribe me and do not contact me again.' },
];

export function ReplyModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [text, setText] = useState(REPLY_PRESETS[1].text);
  const { busy, run } = useAction();
  const toast = useToast();

  const send = async () => {
    const result = await run(() => candidatesApi.simulateReply(candidate.id, text));
    if (result) {
      toast('Reply received. The AI is classifying it.', 'ok');
      onClose();
    }
  };

  return (
    <Modal title={`Simulate a reply from ${candidate.name}`} onClose={onClose}>
      <div className="chips tight">
        {REPLY_PRESETS.map((p) => (
          <button key={p.label} className="chip" onClick={() => setText(p.text)}>
            {p.label}
          </button>
        ))}
      </div>
      <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy || !text.trim()} onClick={send}>
          {busy ? <Spinner /> : <Icon name="send" />} Send reply
        </button>
      </div>
    </Modal>
  );
}
