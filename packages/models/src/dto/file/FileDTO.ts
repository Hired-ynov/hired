import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { BaseDTO } from '../utils/BaseDTO';
import { MetadataDTO } from '../utils/MetadataDTO';
import { ApiProperty } from '@nestjs/swagger';

export class FileDTO extends BaseDTO {
  @ApiProperty({
    description: 'Nom du fichier',
    example: 'fichier.pdf',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Chemin relatif du fichier',
    example: '',
  })
  @IsString()
  path: string;

  @ApiProperty({
    description: 'Type du fichier',
    example: 'pdf',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Données du fichier',
    example: {
      size: 548_785,
      hash: '',
    },
  })
  @IsOptional()
  @Type(() => MetadataDTO)
  metadata?: MetadataDTO;
}
