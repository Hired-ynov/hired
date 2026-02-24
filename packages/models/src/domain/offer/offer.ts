import { Base } from '../base';
import { Skill } from '../enum/skill.enum';
import { SalaryRange } from '../utils/salary-range';

export interface Offer extends Base {
  companyId: string;
  description: string;
  filesIds: string[];
  location: string;
  salaryRange: SalaryRange;
  skills: Skill[];
  title: string;
}
