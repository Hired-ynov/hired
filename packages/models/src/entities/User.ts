import { Role } from './Role';
import type { Skill } from './Skill';
import { BaseEntity } from './BaseEntity';
export interface User extends BaseEntity {
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
