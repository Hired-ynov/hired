import { Base } from '../base';

export interface Conversation extends Base {
  offerId: string;
  participants: string[];
}
