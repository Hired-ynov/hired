import { BaseEntity } from '@repo/nest-service';
import { Application, ApplicationStatus } from '@repo/models';

export class ApplicationEntity extends BaseEntity implements Application {
  userId!: string;
  offerId!: string;
  firstMessage?: string | undefined;
  status!: ApplicationStatus;
  filesIds!: string[];
}
