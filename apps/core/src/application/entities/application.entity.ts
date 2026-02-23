import { BaseEntity } from '@repo/nest-service';
import { Application } from '@repo/models';

export class ApplicationEntity extends BaseEntity implements Application {
  userId!: string;
  offerId!: string;
  firstMessage?: string | undefined;
  status!: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  filesIds!: string[];
}
