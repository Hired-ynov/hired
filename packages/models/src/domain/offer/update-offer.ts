import { Skill } from '../enum/skill.enum';
import { SalaryRange } from '../utils/salary-range';

export class UpdateOffer {
  title?: string;

  description?: string;

  location?: string;

  salaryRange?: SalaryRange;

  companyId?: string;

  skills?: Skill[];

  filesIds?: string[];
}
