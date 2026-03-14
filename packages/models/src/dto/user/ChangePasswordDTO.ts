import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({
    description: "Ancien mot de passe de l'utilisateur",
    example: 'fR2!sP7:',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: "Nouveau mot de passe de l'utilisateur",
    example: 'fR2!sP7:',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  newPassword: string;
}
