import { BaseEntity } from '@repo/nest-service';
import { Application, ApplicationStatus } from '@repo/models';
import { Column, Entity } from 'typeorm';

@Entity('applications')
export class ApplicationEntity extends BaseEntity implements Application {
  @Column()
  userId!: string;

  @Column()
  offerId!: string;

  @Column({ type: 'text', nullable: true })
  firstMessage?: string;

  @Column({ type: 'enum', enum: ApplicationStatus })
  status!: ApplicationStatus;

  @Column('simple-array', { nullable: true })
  filesIds!: string[];
}
