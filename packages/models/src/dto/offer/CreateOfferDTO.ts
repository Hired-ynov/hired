import { IsArray, IsEnum, IsString } from 'class-validator';
import { Skill } from '../../entry';
import { Type } from 'class-transformer';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';

export class CreateOfferDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @Type(() => SalaryRangeDTO)
  salaryRange: SalaryRangeDTO;

  @IsArray()
  @IsEnum(Skill, { each: true })
  skills: Skill[];
}
