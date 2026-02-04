import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDTO } from './CreateMessageDTO';

export class UpdateMessageDTO extends PartialType(CreateMessageDTO) {}
