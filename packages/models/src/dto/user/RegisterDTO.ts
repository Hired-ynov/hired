import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  ValidateIf,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    description: "Mail de l'utilisateur",
    example: 'val.peyratout@sfr.fr',
  })
  @IsEmail({
    allow_ip_domain: false,
    allow_utf8_local_part: false,
    require_tld: true,
  })
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
  password: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'Valentin',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'Peyratout',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "Numéro de téléphone de l'utilisateur",
    example: '+33685476215',
  })
  @IsPhoneNumber()
  @ValidateIf(
    (o: { phoneNumber?: string | null }) =>
      o.phoneNumber !== null && o.phoneNumber !== undefined,
  )
  phoneNumber?: string;
}
