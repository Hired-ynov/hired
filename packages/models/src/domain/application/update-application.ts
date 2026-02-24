import { ApplicationStatus } from '../enum/application-status.enum';

export class UpdateApplication {
  firstMessage?: string;

  status?: ApplicationStatus;

  filesIds?: string[];
}
