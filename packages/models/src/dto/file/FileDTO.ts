import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { BaseDTO } from '../utils/BaseDTO';
import { MetadataDTO } from '../utils/MetadataDTO';

export class FileDTO extends BaseDTO {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  type: string;

  @IsOptional()
  @Type(() => MetadataDTO)
  metadata?: MetadataDTO;
}
