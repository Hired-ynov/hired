import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

import { BaseDTO } from '../utils/BaseDTO';

export class MessageDTO extends BaseDTO {
  @ApiProperty({
    description: 'Id de la conversation',
    example: '96ea1117-230d-442a-bdd2-0b40280c126a',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    description: "Id de l'utilisateur qui a envoyé le message",
    example: '96ea1117-230d-442a-bdd2-0b40280c126a',
  })
  @IsUUID()
  senderId: string;

  @ApiProperty({
    description: 'Contenu du message',
    example: 'Voici le message',
  })
  @IsString()
  content: string;
}
