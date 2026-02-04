import { BaseEntity } from './BaseEntity';
export interface Application extends BaseEntity {
  userId: string;
  offerId: string;
  firstMessage?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  filesIds: string[];
}
