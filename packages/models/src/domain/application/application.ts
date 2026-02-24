import { Base } from '../base';
import { ApplicationStatus } from '../enum/application-status.enum';

export interface Application extends Base {
  filesIds: string[];
  firstMessage?: string;
  offerId: string;
  status: ApplicationStatus;
  userId: string;
}
