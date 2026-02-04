import { IsString } from 'class-validator';
import { BaseDTO } from '../baseDTO';

export class FileUploadResponseDto extends BaseDTO {
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
