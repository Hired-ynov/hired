import { Base } from '../base';

export interface Message extends Base {
  content: string;
  conversationId: string;
  senderId: string;
}
