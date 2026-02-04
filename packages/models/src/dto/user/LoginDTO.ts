import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDTO {
  @IsEmail({
    allow_ip_domain: false,
    allow_utf8_local_part: false,
    require_tld: true,
  })
  @IsNotEmpty()
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password: string;
}
