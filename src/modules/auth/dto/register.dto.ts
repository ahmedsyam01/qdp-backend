import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidPhoneNumber } from '../../../common/validators/phone-number.validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed Mohammed Al-Kuwari', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '28012345678', description: 'Qatar ID or Residence Permit number' })
  @IsString()
  @IsNotEmpty()
  identityNumber: string; // Qatar ID or Residence Permit

  @ApiProperty({ example: '+97412345678', description: 'Phone number in E.164 format (e.g., +97412345678, +14155552671)' })
  @IsString()
  @IsNotEmpty()
  @IsValidPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'ahmed@example.com', description: 'User email address', required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
