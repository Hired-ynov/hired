import { IsString } from 'class-validator';
import { Skill } from '../../entry';

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
