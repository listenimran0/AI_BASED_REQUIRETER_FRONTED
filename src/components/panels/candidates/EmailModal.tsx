import { useState } from 'react';
import { candidatesApi } from '@/api';
import { type Candidate } from '@/types';
import { Modal, Spinner } from '@/components/ui';
import { useAction } from '@/hooks/useAction';
import { useToast } from '@/context/ToastContext';

export function EmailModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [email, setEmail] = useState(candidate.email || '');
  const { busy, run } = useAction();
  const toast = useToast();

  const save = async () => {
    const result = await run(() => candidatesApi.setCandidateEmail(candidate.id, email));
    if (result) {
      toast('Email saved', 'ok');
      onClose();
    }
  };

  return (
    <Modal title={`Email for ${candidate.name}`} onClose={onClose}>
      <input className="input" type="email" autoFocus placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" disabled={busy || !email.trim()} onClick={save}>
          {busy ? <Spinner /> : null} Save
        </button>
      </div>
    </Modal>
  );
}
