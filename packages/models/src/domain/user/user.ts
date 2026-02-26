import { Base } from '../base';
import { Role } from '../enum/role.enum';
import { Skill } from '../enum/skill.enum';

export interface User extends Base {
  companyId?: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  passwordHash: string;
  phoneNumber: string;
  role: Role;
  skills: Skill[];
}
