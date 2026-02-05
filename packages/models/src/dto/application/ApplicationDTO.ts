import { IsEnum, IsString } from 'class-validator';
import { ApplicationStatus } from '../../enums/application/ApplicationStatus';
import { BaseDTO } from '../utils';

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
