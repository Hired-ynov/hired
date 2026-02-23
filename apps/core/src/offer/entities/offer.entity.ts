import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@repo/nest-service';
import { Offer, Skill } from '@repo/models';
import { SalaryRange } from '@repo/models/dist/entities/utils/SalaryRange';
import { CompanyEntity } from '../../company/entities/company.entity';

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
  company: CompanyEntity;

  @Column('simple-array')
  skills!: Skill[];

  @Column('simple-array', { nullable: true })
  filesIds!: string[];
}
