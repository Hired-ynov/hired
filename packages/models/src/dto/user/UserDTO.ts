import { Skill } from '../../entities/Skill';
import { Role } from '../../entities/Role';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  role: Role;
  location: string;
  phoneNumber: string;
  companyId?: string | undefined;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
}
