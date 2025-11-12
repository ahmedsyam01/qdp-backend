import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPhoneNumber } from '../../../common/validators/phone-number.validator';

export class ResendOtpDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number to resend OTP' })
  @IsString()
  @IsNotEmpty()
  @IsValidPhoneNumber()
  phone: string;
}
