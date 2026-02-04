import { Skill } from './Skill';
import { BaseEntity } from './BaseEntity';
import { SalaryRange } from './utils/SalaryRange';

export interface Offer extends BaseEntity {
  title: string;
  description: string;
  location: string;
  salaryRange: SalaryRange;
  companyId: string;
  skills: Skill[];
  filesIds: string[];
}
