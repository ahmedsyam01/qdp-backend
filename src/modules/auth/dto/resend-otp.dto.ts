import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number to resend OTP' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
