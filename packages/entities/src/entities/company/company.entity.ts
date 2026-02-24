import { Company } from '@repo/models';
import { BaseEntity } from '@repo/nest-service';
import { Column } from 'typeorm';

export class CompanyEntity extends BaseEntity implements Company {
  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  website!: string;
}
