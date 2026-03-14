import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDTO {
  @ApiProperty({
    description: "Id de l'offre",
    example: 'bf521f17-52b6-4160-a907-4c55f9147ff7',
  })
  @IsString()
  offerId: string;

  @ApiProperty({
    description: "Id de l'utilisateur",
    example: 'bf521f17-52b6-4160-a907-4c55f9147ff7',
  })
  @IsOptional()
  @IsString()
  firstMessage?: string;

  @ApiProperty({
    description: 'Ids des fichiers associés',
    example:
      "['bf521f17-52b6-4160-a907-4c55f9147ff7', 'bf521f17-52b6-4160-a907-4c55f9147ff7', \'bf521f17-52b6-4160-a907-4c55f9147ff7\']",
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  filesIds?: string[];
}
