import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Skill } from '../../entry';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOfferDTO {
  @ApiProperty({
    description: "Titre de l'offre",
    example: 'Commercial',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "Descritpion de l'offre",
    example: 'Recherche un commercial pour un futur projet SAS',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Localisation de l'offre",
    example:
      'Parc AMPeRIS, bâtiment Canopée, 6 Rue Adrienne Bolland, 33600 Pessac',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: "Salaire minimal/maximal de l'offre",
    example: {
      max: 55_000,
      min: 30_000,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryRangeDTO)
  salaryRange?: SalaryRangeDTO;

  @ApiProperty({
    description: 'Id de la société concernée',
    example: '96ea1117-230d-442a-bdd2-0b40280c126a',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({
    description: "Compétences requis pour l'offre",
    example: [Skill.CI_CD, Skill.DEVOPS, Skill.ARCHITECTURE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills?: Skill[];

  @ApiProperty({
    description: "Documents associés à l'offre",
    example: [
      'bf521f17-52b6-4160-a907-4c55f9147ff7',
      'cf521f17-52b6-4160-a907-4c55f9147ff8',
      'df521f17-52b6-4160-a907-4c55f9147ff9',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
