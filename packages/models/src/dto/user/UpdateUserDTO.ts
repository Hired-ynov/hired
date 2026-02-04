import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './CreateUserDTO';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}
