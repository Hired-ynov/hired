import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

import { OfferDTO } from '../offer';
import { BaseDTO } from '../utils';

export class ConversationDTO extends BaseDTO {
  @ApiProperty({
    description: "L'ids des participants de la conversation",
    example:
      "['bf521f17-52b6-4160-a907-4c55f9147ff7', 'bf521f17-52b6-4160-a907-4c55f9147ff7', 'bf521f17-52b6-4160-a907-4c55f9147ff7']",
  })
  @IsArray()
  @IsUUID(4, { each: true })
  participantIds: string[];

  @ApiProperty({
    description: "Id de l'offre",
    type: 'string',
  })
  @IsUUID()
  offerId: string;

  @ApiProperty({
    description: "Détail de l'offre",
    example: {
      company: {
        description: 'SQLI est une société offrant des serivces digitaux.',
        name: 'SQLI',
        website: 'https://www.sqli.com',
      },
      createdAt: '2026-02-26T14:30:00.000Z',
      description: 'Recherche un commercial pour un futur projet SAS',
      filesIds: [
        'bf521f17-52b6-4160-a907-4c55f9147ff7',
        'cf521f17-52b6-4160-a907-4c55f9147ff8',
        'df521f17-52b6-4160-a907-4c55f9147ff9',
      ],
      id: '7f2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      location:
        'Parc AMPeRIS, bâtiment Canopée, 6 Rue Adrienne Bolland, 33600 Pessac',
      salaryRange: {
        max: 55_000,
        min: 30_000,
      },
      skills: ['CI_CD', 'DEVOPS', 'ARCHITECTURE'],
      title: 'Commercial',
      updatedAt: '2026-02-26T14:30:00.000Z',
    },
  })
  @ValidateNested()
  @Type(() => OfferDTO)
  offer: OfferDTO;
}
