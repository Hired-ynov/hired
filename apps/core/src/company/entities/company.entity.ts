import { Company } from '@repo/entities';
import { BaseEntity } from '@repo/nest-service';

export class CompanyEntity extends BaseEntity implements Company {
  name!: string;
  description!: string;
  website!: string;
  toto!: Company;
}
