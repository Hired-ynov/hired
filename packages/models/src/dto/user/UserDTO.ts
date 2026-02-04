import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Skill } from '../../entities/Skill';
import { Role } from '../../entities/Role';
import { BaseDTO } from '../baseDTO/BaseDTO';

export class UserDTO extends BaseDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  location: string;

  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];
}
