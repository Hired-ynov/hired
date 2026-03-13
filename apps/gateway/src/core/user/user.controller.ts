import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public, Roles } from '@repo/commun';
import {
  CreateUserDTO,
  UserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  CreateUser,
  UpdateUser,
  ChangePassword,
  Role,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDTO): Promise<UserDTO> {
    const createUser = plainToInstance(CreateUser, createUserDto);
    const user = await firstValueFrom(
      this.userService.send<UserDTO>('core.user.create', createUser),
    );
    return plainToInstance(UserDTO, user);
  }

  @Get()
  @Roles(Role.admin)
  async findAll(): Promise<UserDTO[]> {
    const users = await firstValueFrom(
      this.userService.send<UserDTO[]>('core.user.find-all', {}),
    );
    return users.map((user) => plainToInstance(UserDTO, user));
  }

  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserDTO | null> {
    const user = await firstValueFrom(
      this.userService.send<UserDTO | null>('core.user.find-one-by-email', {
        email,
      }),
    );
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDTO | null> {
    const user = await firstValueFrom(
      this.userService.send<UserDTO | null>('core.user.find-one-by-id', { id }),
    );
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @Put(':id/change-password')
  @Roles(Role.user, Role.admin)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDTO,
  ): Promise<{ message: string }> {
    const changePassword = plainToInstance(ChangePassword, changePasswordDto);
    return firstValueFrom(
      this.userService.send<{ message: string }>('core.user.change-password', {
        changePasswordDto: changePassword,
        id,
      }),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const updateUser = plainToInstance(UpdateUser, updateUserDto);
    const user = await firstValueFrom(
      this.userService.send<UserDTO>('core.user.update', { id, updateUser }),
    );
    return plainToInstance(UserDTO, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await firstValueFrom(
      this.userService.send<unknown>('core.user.remove', { id }),
    );
  }
}
