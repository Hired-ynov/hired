import { BaseEntity } from '@repo/nest-service';
import { User as DomainUser, Skill, Role } from '@repo/models';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class User extends BaseEntity implements DomainUser {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: Role.user })
  role!: Role;

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  companyId?: string;

  @Column('text', { array: true, default: [] })
  skills!: Skill[];
}
