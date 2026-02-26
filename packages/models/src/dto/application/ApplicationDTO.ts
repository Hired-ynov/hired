import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApplicationStatus } from '../../entry';
import { BaseDTO } from '../utils';

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
