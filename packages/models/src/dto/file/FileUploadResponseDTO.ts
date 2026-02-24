import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { BaseDTO } from '../utils/BaseDTO';
import { MetadataDTO } from '../utils/MetadataDTO';

export class FileUploadResponseDTO extends BaseDTO {
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
