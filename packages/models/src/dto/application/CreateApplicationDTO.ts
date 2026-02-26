import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDTO {
  @IsString()
  offerId: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
