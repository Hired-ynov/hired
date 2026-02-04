import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Skill } from '../../entry';
import { SalaryRangeDTO } from '../utils/SalaryRangeDTO';
import { Type } from 'class-transformer';

export class UpdateOfferDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  @Type(() => SalaryRangeDTO)
  salaryRange?: SalaryRangeDTO;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Skill, { each: true })
  skills?: Skill[];

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
