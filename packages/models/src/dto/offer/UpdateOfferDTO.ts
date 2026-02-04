import { IsOptional, IsString } from 'class-validator';
import { Skill } from '../../entry';

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
  @IsUUID({ each: true })
  filesIds?: string[];
}
