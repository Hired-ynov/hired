import { IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  offerId: string;

  @IsString()
  firstMessage?: string;

  @IsString()
  filesIds?: string[];
}
