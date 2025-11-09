import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number for password reset' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
