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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, Roles, CurrentUser } from '@repo/commun';
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
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject(microservices.symbols.CORE_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ description: 'Utilisateur créé', status: 201 })
  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDTO): Promise<UserDTO> {
    const createUser = plainToInstance(CreateUser, createUserDto);
    const user = await firstValueFrom(
      this.userService.send('core.user.create', createUser),
    );
    return plainToInstance(UserDTO, user);
  }

  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ description: 'Utilisateurs récupérés', status: 201 })
  @Get()
  @Roles(Role.admin)
  async findAll(): Promise<UserDTO[]> {
    const users = await firstValueFrom(
      this.userService.send('core.user.find-all', {}),
    );
    return users.map((user) => plainToInstance(UserDTO, user));
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur par son email' })
  @ApiResponse({ description: 'Utilisateur récupéré', status: 201 })
  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserDTO | null> {
    const user = await firstValueFrom(
      this.userService.send('core.user.find-one-by-email', { email }),
    );
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur' })
  @ApiResponse({ description: 'Utilisateur récupéré', status: 201 })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserDTO | null> {
    const user = await firstValueFrom(
      this.userService.send('core.user.find-one-by-id', { id }),
    );
    return user ? plainToInstance(UserDTO, user) : null;
  }

  @ApiOperation({ summary: "Mettre à jour le mdp d'un utilisateur" })
  @ApiResponse({ description: 'Mdp mis à jour', status: 201 })
  @Put(':id/change-password')
  @Roles(Role.user)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDTO,
  ): Promise<{ message: string }> {
    const changePassword = plainToInstance(ChangePassword, changePasswordDto);
    return firstValueFrom(
      this.userService.send('core.user.change-password', {
        changePasswordDto: changePassword,
        id,
      }),
    );
  }

  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ description: 'Utilisateur mis à jour', status: 201 })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const updateUser = plainToInstance(UpdateUser, updateUserDto);
    const user = await firstValueFrom(
      this.userService.send('core.user.update', { id, updateUser }),
    );
    return plainToInstance(UserDTO, user);
  }

  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ description: 'Utilisateur supprimé', status: 201 })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return firstValueFrom(this.userService.send('core.user.remove', { id }));
  }
}
