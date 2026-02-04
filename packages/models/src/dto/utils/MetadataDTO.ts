import { IsNumber, IsPositive, IsString } from 'class-validator';

export class MetadataDTO {
  @IsNumber()
  @IsPositive()
  size: number;

  @IsString()
  hash: string;
}
