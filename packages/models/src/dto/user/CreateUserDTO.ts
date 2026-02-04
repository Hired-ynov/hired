import { User } from '../../entities/User';
import { Skill } from '../../entities/Skill';

export interface CreateUserDto
  extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: User['role'];
  location: string;
  phoneNumber: string;
  companyId?: string;
  skills: Skill[];
}
