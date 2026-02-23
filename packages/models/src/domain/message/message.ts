import { Base } from '../base';

export interface Message extends Base {
  conversationId: string;
  senderId: string;
  content: string;
}
