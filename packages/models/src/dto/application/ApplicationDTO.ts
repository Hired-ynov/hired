import { IsEnum, IsString } from 'class-validator';
import { BaseDTO } from '../utils';
import { ApplicationStatus } from '../../entry';

export class ApplicationDTO extends BaseDTO {
  @IsString()
  userId: string;

  @IsString()
  offerId: string;

  @IsString()
  firstMessage?: string;

  @IsEnum({ enum: ['pending', 'reviewed', 'accepted', 'rejected'] })
  status: ApplicationStatus;

  @IsString()
  filesIds?: string[];
}
