import { IsString } from 'class-validator';
import { BaseDTO } from '../baseDTO/BaseDTO';

export class CompanyDto extends BaseDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  website: string;
}
