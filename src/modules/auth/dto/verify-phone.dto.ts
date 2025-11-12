import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPhoneNumber } from '../../../common/validators/phone-number.validator';

export class VerifyPhoneDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  @IsValidPhoneNumber()
  phone: string;

  @ApiProperty({ example: '12345', description: '5-digit OTP code' })
  @IsString()
  @Length(5, 5, { message: 'OTP must be exactly 5 digits' })
  otp: string;
}
