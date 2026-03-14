import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDTO {
  @ApiProperty({
    description: "Id de l'offre",
    example: '96ea1117-230d-442a-bdd2-0b40280c126a',
  })
  @IsUUID()
  offerId: string;
}
