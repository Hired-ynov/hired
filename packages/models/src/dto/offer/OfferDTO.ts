import { CompanyDTO } from '../company/CompanyDTO';
import { Skill } from '../../entry';
import { BaseDTO } from '../utils/BaseDTO';
import { Type } from 'class-transformer';
import { IsString, IsArray, IsEnum, IsUUID } from 'class-validator';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';

export class OfferDTO extends BaseDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @Type(() => SalaryRangeDTO)
  salaryRange: SalaryRangeDTO;

  @Type(() => CompanyDTO)
  company: CompanyDTO;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];

  @IsArray()
  @IsUUID(4, { each: true })
  filesIds: string[];
}
