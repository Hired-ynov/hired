import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDTO {
  @ApiProperty({
    description: 'Nom de la société a créer',
    example: 'SQLI',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description de la société a créer',
    example: 'SQLI est une société offrant des serivces digitaux.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'URL de la société a créer',
    example: 'https://www.sqli.com/fr-fr',
  })
  @IsString()
  website: string;
}
