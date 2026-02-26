import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty({
    description: 'Message MQTT',
    example: 'Voici mon message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  @MinLength(1, { message: 'Message must contain at least 1 character' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  @Transform(({ value }) => value?.trim())
  content: string;
}
