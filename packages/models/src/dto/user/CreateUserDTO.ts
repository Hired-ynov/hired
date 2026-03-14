import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
} from 'class-validator';

import { Role, Skill } from '../../domain';

export class CreateUserDTO {
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
    description: "Mot de passe de l'utilisateur",
    example: 'DoudouLove33!',
  })
  @IsString()
  @MinLength(8)
  password: string;

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
  phoneNumber: string;

  @ApiProperty({
    description: "Id de la société de l'utilisateur",
    example: '96ea1117-230d-442a-bdd2-0b40280c126a',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({
    description: "Compétences de l'utilisateur",
    example: [Skill.CI_CD, Skill.DEVOPS, Skill.ARCHITECTURE],
  })
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];
}
