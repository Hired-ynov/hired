import { IsEnum, IsString } from 'class-validator';

import { ApplicationStatus } from '../../enums/application/ApplicationStatus';

export class UpdateApplicationDto {
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
