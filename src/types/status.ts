export type Status =
  | 'sourced'
  | 'accepted'
  | 'rejected'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'not_interested'
  | 'meeting_booked'
  | 'interviewed'
  | 'shortlisted'
  | 'hired'
  | 'unsubscribed';

export const STATUS_LABEL: Record<Status, string> = {
  sourced: 'Sourced',
  accepted: 'Accepted',
  rejected: 'Rejected',
  contacted: 'Contacted',
  replied: 'Replied',
  interested: 'Interested',
  not_interested: 'Not interested',
  meeting_booked: 'Meeting booked',
  interviewed: 'Interviewed',
  shortlisted: 'Shortlisted',
  hired: 'Hired',
  unsubscribed: 'Unsubscribed',
};
