import { IsString } from 'class-validator';
import { BaseDTO } from '../baseDTO';

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
