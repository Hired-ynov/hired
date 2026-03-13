import { Transform, type TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function sanitizeMessageContent({ value }: TransformFnParams): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  return String(value ?? '').trim();
}

export class CreateMessageDTO {
  @ApiProperty({
    description: 'Message MQTT',
    example: 'Voici mon message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  @MinLength(1, { message: 'Message must contain at least 1 character' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  @Transform(sanitizeMessageContent)
  content: string;
}
