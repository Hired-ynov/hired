import {
  IsEmail,
  IsString,
  IsStrongPassword,
  ValidateIf,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDTO {
  @IsEmail({
    allow_ip_domain: false,
    allow_utf8_local_part: false,
    require_tld: true,
  })
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  @ValidateIf(
    (o: { phoneNumber?: string | null }) =>
      o.phoneNumber !== null && o.phoneNumber !== undefined,
  )
  phoneNumber?: string;
}
