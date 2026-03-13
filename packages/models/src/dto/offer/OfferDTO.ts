import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { Skill } from '../../entry';
import { CompanyDTO } from '../company/CompanyDTO';
import { BaseDTO } from '../utils/BaseDTO';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';

export class OfferDTO extends BaseDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @ValidateNested()
  @Type(() => SalaryRangeDTO)
  salaryRange: SalaryRangeDTO;

  @ValidateNested()
  @Type(() => CompanyDTO)
  company: CompanyDTO;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];

  @IsArray()
  @IsUUID(4, { each: true })
  filesIds: string[];
}
