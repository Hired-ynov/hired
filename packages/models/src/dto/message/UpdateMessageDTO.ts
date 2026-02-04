import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './CreateMessageDTO';

export class UpdateMessageDTO extends PartialType(CreateMessageDto) {}
