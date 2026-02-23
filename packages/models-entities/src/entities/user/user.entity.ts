import { BaseEntity } from '@repo/nest-service';
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role, Skill, User } from '@repo/models';

@Entity('users')
export class UserEntity extends BaseEntity implements User {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  @Exclude()
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
