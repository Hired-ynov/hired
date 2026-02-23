import { IsString } from 'class-validator';

export class CreateApplicationDTO {
  @IsString()
  offerId: string;

  @IsString()
  firstMessage?: string;

  @IsString()
  filesIds?: string[];
}
