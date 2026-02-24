import { Skill } from '..';
import { Role } from '../enum/role.enum';

export class CreateUser {
  firstName: string;

  lastName: string;

  email: string;

  password: string;

  role: Role;

  location: string;

  phoneNumber: string;

  companyId?: string;

  skills: Skill[];
}
