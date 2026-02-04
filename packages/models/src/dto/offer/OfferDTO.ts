import { CompanyDto } from '../company/CompanyDTO';
import { Skill } from '../../entry';
import { BaseDTO } from '../baseDTO/BaseDTO';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class OfferDto extends BaseDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @Type(() => SalaryRangeDTO)
  salaryRange: SalaryRangeDTO;

  @Type(() => CompanyDto)
  company: CompanyDto;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];

  @IsArray()
  @IsUUID({ each: true })
  filesIds: string[];
}
