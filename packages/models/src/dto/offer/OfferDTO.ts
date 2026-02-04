import { CompanyDTO } from '../company/CompanyDTO';
import { Skill } from '../../entry';
import { BaseDTO } from '../utils/BaseDTO';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsUUID } from 'class-validator';
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
