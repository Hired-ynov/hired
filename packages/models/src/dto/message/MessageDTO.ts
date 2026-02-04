import { IsString, IsUUID } from 'class-validator';
import { BaseDTO } from '../baseDTO/BaseDTO';

export class MessageDto extends BaseDTO {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;
}
