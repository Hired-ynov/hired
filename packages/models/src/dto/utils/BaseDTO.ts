import { Type } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';

export class BaseDTO {
  @IsUUID()
  id: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
