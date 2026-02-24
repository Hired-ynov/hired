import { IsEnum, IsString } from 'class-validator';
import { ApplicationStatus } from '../../entry';

export class UpdateApplicationDTO {
  @IsString()
  firstMessage?: string;

  @IsEnum({
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    required: false,
  })
  status?: ApplicationStatus;

  @IsString()
  filesIds?: string[];
}
