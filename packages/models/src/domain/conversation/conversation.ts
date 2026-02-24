import { Base } from '../base';

export interface Conversation extends Base {
  participants: string[];
  offerId: string;
}
