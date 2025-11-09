import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+97412345678', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
