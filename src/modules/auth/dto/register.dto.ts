import { IsString, IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed Mohammed Al-Kuwari', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '28012345678', description: 'Qatar ID or Residence Permit number' })
  @IsString()
  @IsNotEmpty()
  identityNumber: string; // Qatar ID or Residence Permit

  @ApiProperty({ example: '+97412345678', description: 'Phone number in format +974XXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+974\d{8}$/, {
    message: 'Phone number must be in format +974XXXXXXXX',
  })
  phone: string;

  @ApiProperty({ example: 'ahmed@example.com', description: 'User email address', required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}
