import type { Status } from './status';

export type Candidate = {
  id: string;
  jobId: string;
  name: string;
  email?: string;
  profileUrl?: string;
  headline?: string;
  company?: string;
  location?: string;
  skills: string[];
  source: string;
  status: Status;
  score?: number | null;
  scoreReason?: string;
  matchedSkills: string[];
  missingSkills: string[];
  dataQuality?: string;
  scoreError?: string;
  injectionFlag: boolean;
  bookingToken?: string;
  next: Status[];
};
