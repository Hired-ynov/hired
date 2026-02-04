import { IsString, IsUUID } from 'class-validator';
import { BaseDTO } from '../utils/BaseDTO';

export class MessageDTO extends BaseDTO {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;
}
