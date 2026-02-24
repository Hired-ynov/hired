import { Base } from '../base';
import { Role } from '../enum/role.enum';
import { Skill } from '../enum/skill.enum';
export interface User extends Base {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  location: string;
  phoneNumber: string;
  skills: Skill[];
  companyId?: string;
}
