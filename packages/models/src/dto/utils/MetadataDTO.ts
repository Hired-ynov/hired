import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class MetadataDTO {
  @ApiProperty({
    description: 'Poids du fichier',
    example: 254_189,
  })
  @IsNumber()
  @IsPositive()
  size: number;

  @ApiProperty({
    description: 'Hash du fichier',
    example: '',
  })
  @IsString()
  hash: string;
}
