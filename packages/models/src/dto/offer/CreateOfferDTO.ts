import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

import { Skill } from '../../entry';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDTO {
  @ApiProperty({
    description: "Titre de l'offre",
    example: 'Commercial',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Descritpion de l'offre",
    example: 'Recherche un commercial pour un futur projet SAS',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "Localisation de l'offre",
    example:
      'Parc AMPeRIS, bâtiment Canopée, 6 Rue Adrienne Bolland, 33600 Pessac',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: "Salaire minimal/maximal de l'offre",
    example: {
      max: 55_000,
      min: 30_000,
    },
  })
  @ValidateNested()
  @Type(() => SalaryRangeDTO)
  salaryRange: SalaryRangeDTO;

  @ApiProperty({
    description: "Compétences requis pour l'offre",
    example: [Skill.CI_CD, Skill.DEVOPS, Skill.ARCHITECTURE],
  })
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];
}
