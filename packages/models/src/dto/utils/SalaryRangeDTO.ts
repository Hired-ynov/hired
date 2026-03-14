import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SalaryRangeDTO {
  @ApiProperty({
    description: 'Tranche salariale basse',
    example: 30_000,
  })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({
    description: 'Tranche salariale haute',
    example: 55_000,
  })
  @IsNumber()
  @Min(0)
  max: number;
}
