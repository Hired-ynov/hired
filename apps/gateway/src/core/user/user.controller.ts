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
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import {
  CreateUserDTO,
  UserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  CreateUser,
  UpdateUser,
  ChangePassword,
  User,
  Role,
} from '@repo/models';
import { microservices } from '@repo/rabbitmq-config';
import { Public, Roles, CurrentUser } from '@repo/commun';

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
    const user = (await firstValueFrom(
      this.userService.send('core.user.create', createUser),
    )) as User;
    return plainToInstance(UserDTO, user);
  }

  @Get()
  @Roles(Role.admin)
  async findAll(): Promise<UserDTO[]> {
    const users = (await firstValueFrom(
      this.userService.send('core.user.find-all', {}),
    )) as User[];
    return users.map((user) => plainToInstance(UserDTO, user));
  }

  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserDTO | null> {
    const user = (await firstValueFrom(
      this.userService.send('core.user.find-one-by-email', { email }),
    )) as User;
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserDTO | null> {
    const user = (await firstValueFrom(
      this.userService.send('core.user.find-one-by-id', { id }),
    )) as User;
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @Put(':id/change-password')
  @Roles(Role.user)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDTO,
  ): Promise<{ message: string }> {
    const changePassword = plainToInstance(ChangePassword, changePasswordDto);
    return firstValueFrom(
      this.userService.send('core.user.change-password', {
        id,
        changePasswordDto: changePassword,
      }),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const updateUser = plainToInstance(UpdateUser, updateUserDto);
    const user = (await firstValueFrom(
      this.userService.send('core.user.update', { id, updateUser }),
    )) as User;
    return plainToInstance(UserDTO, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.userService.send('core.user.remove', { id }));
  }
}
