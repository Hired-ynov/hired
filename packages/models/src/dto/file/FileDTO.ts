import { IsOptional, IsString } from 'class-validator';
import { BaseDTO } from '../baseDTO/BaseDTO';

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
