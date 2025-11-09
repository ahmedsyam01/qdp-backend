import { IsString, IsNotEmpty, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '12345', description: '5-digit OTP code received via SMS' })
  @IsString()
  @Length(5, 5)
  otp: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
