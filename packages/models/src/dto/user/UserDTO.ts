import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  IsPhoneNumber,
} from 'class-validator';
import { BaseDTO } from '../utils/BaseDTO';
import { Role, Skill } from '../../domain';
import { ApiProperty } from '@nestjs/swagger';

export class UserDTO extends BaseDTO {
  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'Valentin',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'Peyratout',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "Mail de l'utilisateur",
    example: 'val.peyratout@sfr.fr',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur hashé",
    example: 'rgverhfngosdigvuzg5944rgvsr4fv6gsr4gv6sr1gv4gsrvr6',
  })
  @IsOptional()
  @IsString()
  passwordHash?: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: ['admin', 'user'],
    example: 'admin',
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    description: "Adresse de l'utilisateur",
    example: 'Pont de Pierre, 33000 Bordeaux',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: "Numéro de téléphone de l'utilisateur",
    example: '+33685476215',
  })
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
