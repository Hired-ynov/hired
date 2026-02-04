import { Role } from './Role';
import type { Skill } from './Skill';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  location: string;
  phoneNumber: string;
  skills: Skill[];
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
}
