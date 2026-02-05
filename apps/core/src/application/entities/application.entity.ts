import { BaseEntity } from '@repo/nest-service';
import { Application } from '@repo/models';

export class ApplicationEntity extends BaseEntity implements Application {
  name!: string;
  description!: string;
  website!: string;
  toto!: Application;
}
