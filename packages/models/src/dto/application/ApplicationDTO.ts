import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApplicationStatus } from '../../entry';
import { BaseDTO } from '../utils';

export class ApplicationDTO extends BaseDTO {
  @ApiProperty({
    description: "Id de l'utilisateur",
    example: 'bf521f17-52b6-4160-a907-4c55f9147ff7',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Id de l'offre",
    example: 'bf521f17-52b6-4160-a907-4c55f9147ff7',
  })
  @IsString()
  offerId: string;

  @ApiProperty({
    description: "Premier message de l'utilisateur",
    example:
      "Bonjour, je suis très intéressé par votre offre. Auriez-vous quelques instants à m'accorder ?",
  })
  @IsOptional()
  @IsString()
  firstMessage?: string;

  @ApiProperty({
    description: 'Status de la demande',
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    example: 'reviewed',
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

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
