import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { BaseDTO } from '../utils/BaseDTO';

export class CompanyDTO extends BaseDTO {
  @ApiProperty({
    description: 'Nom de la société',
    example: 'SQLI',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description de la société',
    example: 'SQLI est une société offrant des serivces digitaux.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'URL de la société',
    example: 'https://www.sqli.com/fr-fr',
  })
  @IsString()
  website: string;
}
