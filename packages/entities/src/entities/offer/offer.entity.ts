import { Offer, Skill } from '@repo/models';
import { BaseEntity } from '@repo/nest-service';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CompanyEntity } from '../company/company.entity';

import type { SalaryRange } from '@repo/models';

@Entity('offers')
export class OfferEntity extends BaseEntity implements Offer {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  location!: string;

  @Column('simple-json')
  salaryRange!: SalaryRange;

  @Column()
  companyId!: string;

  @ManyToOne(() => CompanyEntity, { eager: false })
  @JoinColumn({ name: 'companyId' })
  company!: CompanyEntity;

  @Column('simple-array')
  skills!: Skill[];

  @Column('simple-array', { nullable: true })
  filesIds!: string[];
}
