import { Skill } from './Skill';
import { BaseEntity } from './BaseEntity';
export interface Offer extends BaseEntity {
  title: string;
  description: string;
  location: string;
  salaryRange: SalaryRange;
  companyId: string;
  skills: Skill[];
  filesIds: string[];
}
