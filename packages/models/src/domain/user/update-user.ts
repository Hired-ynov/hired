import { PartialType } from '@nestjs/mapped-types';

import { CreateUser } from './create-user';

export class UpdateUser extends PartialType(CreateUser) {}
