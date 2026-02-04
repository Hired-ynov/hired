import { BaseEntity } from './BaseEntity';

export interface Conversation extends BaseEntity {
  participants: string[];
  offerId: string;
}
