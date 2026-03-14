import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { Skill } from '../../entry';
import { CompanyDTO } from '../company/CompanyDTO';
import { BaseDTO } from '../utils/BaseDTO';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';

export class OfferDTO extends BaseDTO {
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
    description: "Salaire minimal/maximal de l'offre",
    example: {
      description: 'SQLI est une société offrant des serivces digitaux.',
      name: 'SQLI',
      website: 'https://www.sqli.com',
    },
  })
  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO;

  @ApiProperty({
    description: "Compétences requis pour l'offre",
    example: [Skill.CI_CD, Skill.DEVOPS, Skill.ARCHITECTURE],
  })
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];

  @ApiProperty({
    description: "Documents associés à l'offre",
    example: [
      'bf521f17-52b6-4160-a907-4c55f9147ff7',
      'cf521f17-52b6-4160-a907-4c55f9147ff8',
      'df521f17-52b6-4160-a907-4c55f9147ff9',
    ],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds: string[];
}
