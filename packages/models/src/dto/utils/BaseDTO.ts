import { Type } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BaseDTO {
  @ApiProperty({
    description: "Id de l'émément",
    example: 'bf521f17-52b6-4160-a907-4c55f9147ff7',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-02-26T08:41:36.693Z',
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Date de modification',
    example: '2026-02-26T08:41:36.693Z',
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
