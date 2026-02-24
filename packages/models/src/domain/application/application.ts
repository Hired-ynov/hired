import { Base } from '../base';
import { ApplicationStatus } from '../enum/application-status.enum';

export interface Application extends Base {
  userId: string;
  offerId: string;
  firstMessage?: string;
  status: ApplicationStatus;
  filesIds: string[];
}
