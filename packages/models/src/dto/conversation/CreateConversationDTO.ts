import { IsUUID } from 'class-validator';

export class CreateConversationDTO {
  @IsUUID()
  offerId: string;
}
