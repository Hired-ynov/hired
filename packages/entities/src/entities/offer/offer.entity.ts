import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@repo/nest-service';
import type { SalaryRange } from '@repo/models';
import { Offer, Skill } from '@repo/models';
import { CompanyEntity } from '../company/company.entity';

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
