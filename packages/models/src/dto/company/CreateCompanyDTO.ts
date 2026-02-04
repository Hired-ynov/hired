import { IsString } from 'class-validator';

export class CreateCompanyDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  website: string;
}
