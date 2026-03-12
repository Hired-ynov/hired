import { Application, ApplicationStatus } from '@repo/models';
import { BaseEntity } from '@repo/nest-service';
import { Column, Entity } from 'typeorm';

@Entity('applications')
export class ApplicationEntity extends BaseEntity implements Application {
  @Column()
  userId!: string;

  @Column()
  offerId!: string;

  @Column({ nullable: true, type: 'text' })
  firstMessage?: string;

  @Column({ enum: ApplicationStatus, type: 'enum' })
  status!: ApplicationStatus;

  @Column('simple-array', { nullable: true })
  filesIds!: string[];
}
