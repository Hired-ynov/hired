import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Role } from '../../entities/Role';
import { Skill } from '../../entities/Skill';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  location: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];
}
