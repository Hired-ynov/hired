import {
  Controller,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ChangePassword,
  CreateUser,
  Role,
  UpdateUser,
  User,
} from '@repo/models';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('core.user.create')
  async create(@Payload() createUser: CreateUser): Promise<User> {
    const { password, ...rest } = createUser;
    if (!password?.trim()) {
      throw new BadRequestException('Password is required');
    }

    const existingUser = await this.userService.findOne({
      email: createUser.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const emptyUser = await this.userService.findAll();
    createUser.role = emptyUser.length === 0 ? Role.admin : Role.user;

    const passwordHash = await this.userService.generatePasswordHash(
      createUser.password,
    );
    const user = await this.userService.create(
      Object.assign({}, createUser, { passwordHash }),
    );

    return user;
  }

  @MessagePattern('core.user.find-all')
  async findAll(): Promise<User[]> {
    const users = await this.userService.findAll();
    return users;
  }

  @MessagePattern('core.user.find-one-by-email')
  async findOneByEmail(
    @Payload() payload: { email: string },
  ): Promise<User | null> {
    const user = await this.userService.findOne({ email: payload.email });
    if (!user) {
      return null;
    }

    return user;
  }

  @MessagePattern('core.user.find-one-by-email-with-password')
  async findOneByEmailWithPassword(
    @Payload() payload: { email: string },
  ): Promise<User | null> {
    const user = await this.userService.findOneByEmailWithPassword(
      payload.email,
    );
    if (!user) {
      return null;
    }

    return user;
  }

  @MessagePattern('core.user.find-one-by-id')
  async findOne(@Payload() payload: { id: string }): Promise<User | null> {
    const user = await this.userService.findById(payload.id);
    if (!user) {
      return null;
    }
    return user;
  }

  @MessagePattern('core.user.update')
  async update(
    @Payload() payload: { id: string; updateUser: UpdateUser },
  ): Promise<User> {
    const existingUser = await this.userService.findById(payload.id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (
      payload.updateUser.email &&
      payload.updateUser.email !== existingUser.email
    ) {
      const emailExists = await this.userService.findOne({
        email: payload.updateUser.email,
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userService.update(payload.id, payload.updateUser);
    const user = await this.userService.findById(payload.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @MessagePattern('core.user.change-password')
  async changePassword(
    @Payload() payload: { id: string; changePasswordDto: ChangePassword },
  ): Promise<{ message: string }> {
    const user = await this.userService.findByIdWithPassword(payload.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await this.userService.verifyPassword(
      payload.changePasswordDto.oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await this.userService.verifyPassword(
      payload.changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const newPasswordHash = await this.userService.generatePasswordHash(
      payload.changePasswordDto.newPassword,
    );

    await this.userService.update(payload.id, {
      passwordHash: newPasswordHash,
    });

    return { message: 'Password changed successfully' };
  }

  @MessagePattern('core.user.verify-password')
  async verifyPassword(
    @Payload() payload: { password: string; passwordHash: string },
  ): Promise<boolean> {
    return this.userService.verifyPassword(
      payload.password,
      payload.passwordHash,
    );
  }

  @MessagePattern('core.user.remove')
  async remove(@Payload() payload: { id: string }): Promise<void> {
    const user = await this.userService.findById(payload.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.remove(payload.id);
  }
}
