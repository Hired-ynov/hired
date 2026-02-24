import { Skill } from '../enum/skill.enum';
import { SalaryRange } from '../utils/salary-range';

export class CreateOffer {
  title: string;

  description: string;

  location: string;

  salaryRange: SalaryRange;

  skills: Skill[];
}
