import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDTO {
  @ApiProperty({
    description: 'Nom de la société a modifier',
    example: 'SQLI',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description de la société a modifier',
    example: 'SQLI est une société offrant des serivces digitaux.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL de la société a modifier',
    example: 'https://www.sqli.com/fr-fr',
  })
  @IsOptional()
  @IsString()
  website?: string;
}
