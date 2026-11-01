import { Footer } from './ActionFooter';
import { type BodyProps } from './types';
import { JobForm } from './JobForm';
import { SourcingForm } from './SourcingForm';
import { StatusPreview } from './StatusPreview';
import { CampaignForm } from './CampaignForm';

export function Body(props: BodyProps) {
  switch (props.action.type) {
    case 'create_job':
      return <JobForm {...props} />;
    case 'start_sourcing':
      return <SourcingForm {...props} />;
    case 'update_status':
      return <StatusPreview {...props} />;
    case 'create_campaign':
      return <CampaignForm {...props} />;
    case 'approve_campaign':
      return (
        <>
          <p className="card-text">
            This will schedule <b>{props.action.payload.drafts}</b> emails for “{props.action.payload.name}”. The first step goes out right away (within the
            daily limit), follow-ups go out on their days, and anyone who replies or unsubscribes is dropped from the sequence.
          </p>
          <Footer busy={props.busy} label="Approve and send" onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />
        </>
      );
    case 'campaign_control':
      return (
        <>
          <p className="card-text">
            {props.action.payload.action === 'pause' ? 'Nothing more will be sent until you resume.' : 'Sending continues from where it stopped.'}
          </p>
          <Footer
            busy={props.busy}
            label={props.action.payload.action === 'pause' ? 'Pause' : 'Resume'}
            onConfirm={() => props.onConfirm()}
            onCancel={props.onCancel}
          />
        </>
      );
    case 'set_auto_reply':
      return (
        <>
          <p className="card-text">
            {props.action.payload.enabled
              ? 'The AI will answer by itself only when a reply is a confident “interested” or “wants a meeting”, has no instruction-like text, and the draft does not mention money or promises. Everything else waits for you.'
              : 'Every reply draft will wait for your approval.'}
          </p>
          <Footer
            busy={props.busy}
            label={props.action.payload.enabled ? 'Turn on' : 'Turn off'}
            onConfirm={() => props.onConfirm()}
            onCancel={props.onCancel}
          />
        </>
      );
    default:
      return <Footer busy={props.busy} label="Confirm" onConfirm={() => props.onConfirm()} onCancel={props.onCancel} />;
  }
}
