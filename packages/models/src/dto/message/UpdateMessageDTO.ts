import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './CreateMessageDTO';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}
