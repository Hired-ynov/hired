import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseDTO } from '../utils';
import { ApplicationStatus } from '../../entry';

export class ApplicationDTO extends BaseDTO {
  @IsString()
  userId: string;

  @IsString()
  offerId: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
