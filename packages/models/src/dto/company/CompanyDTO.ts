import { IsString } from 'class-validator';
import { BaseDTO } from '../utils/BaseDTO';

export class CompanyDTO extends BaseDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  website: string;
}
