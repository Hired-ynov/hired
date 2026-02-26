import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApplicationStatus } from '../../entry';

export class UpdateApplicationDTO {
  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
