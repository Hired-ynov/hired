import { ApplicationStatus } from '../enum/application-status.enum';

export class UpdateApplicationDTO {
  firstMessage?: string;

  status?: ApplicationStatus;

  filesIds?: string[];
}
