import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

import { Skill } from '../../domain';

export class LoginDTO {
  @ApiProperty({
    description: "Mail de l'utilisateur",
    example: 'val.peyratout@sfr.fr',
  })
  @IsEmail({
    allow_ip_domain: false,
    allow_utf8_local_part: false,
    require_tld: true,
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'DoudouLove33!',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsNotEmpty()
  password: string;
}
