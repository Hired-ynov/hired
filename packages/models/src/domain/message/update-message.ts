import { PartialType } from '@nestjs/mapped-types';

import { CreateMessage } from './create-message';

export class UpdateMessage extends PartialType(CreateMessage) {}
