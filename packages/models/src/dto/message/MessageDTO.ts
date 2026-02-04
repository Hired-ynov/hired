import { IsString, IsUUID } from 'class-validator';
import { BaseDTO } from '../baseDTO/BaseDTO';

export class MessageDTO extends BaseDTO {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;
}
