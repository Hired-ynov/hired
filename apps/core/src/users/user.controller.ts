import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTO,
} from '@repo/models';
import { plainToInstance } from 'class-transformer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO): Promise<UserDTO> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userService.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.userService.generatePasswordHash(
      createUserDto.password,
    );
    const user = await this.userService.create({
      ...createUserDto,
      passwordHash,
    });

    const dto = plainToInstance(UserDTO, user, {
      excludeExtraneousValues: false,
    });
    delete dto.passwordHash;
    return dto;
  }

  @Get()
  async findAll(): Promise<UserDTO[]> {
    const users = await this.userService.findAll();
    return plainToInstance(UserDTO, users, { excludeExtraneousValues: false });
  }

  @Get('email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserDTO | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }
    const dto = plainToInstance(UserDTO, user, {
      excludeExtraneousValues: false,
    });
    delete dto.passwordHash;
    return dto;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserDTO | null> {
    const user = await this.userService.findById(id);
    if (!user) {
      return null;
    }
    const dto = plainToInstance(UserDTO, user, {
      excludeExtraneousValues: false,
    });
    // Exclure le passwordHash par défaut
    delete dto.passwordHash;
    return dto;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const existingUser = await this.userService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userService.findOne({
        email: updateUserDto.email,
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userService.update(id, updateUserDto);
    const user = await this.userService.findById(id);

    const dto = plainToInstance(UserDTO, user!, {
      excludeExtraneousValues: false,
    });
    delete dto.passwordHash;
    return dto;
  }

  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDTO,
  ): Promise<{ message: string }> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await this.userService.verifyPassword(
      changePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await this.userService.verifyPassword(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const newPasswordHash = await this.userService.generatePasswordHash(
      changePasswordDto.newPassword,
    );

    await this.userService.update(id, {
      passwordHash: newPasswordHash,
    });

    return { message: 'Password changed successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.remove(id);
  }
}
