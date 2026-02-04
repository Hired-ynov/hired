import { BaseEntity } from './BaseEntity';

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  content: string;
}
