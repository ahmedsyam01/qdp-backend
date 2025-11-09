import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class NewTenantInfoDto {
  @ApiProperty({ example: 'Ahmad Hassan' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+97412345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'ahmad@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  qatarId: string;
}

export class CreateTransferDto {
  @ApiProperty({ example: '68eda9e216e540a5311107e3' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    type: NewTenantInfoDto,
    example: {
      fullName: 'Ahmad Hassan',
      phone: '+97412345678',
      email: 'ahmad@example.com',
      qatarId: '12345678901',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => NewTenantInfoDto)
  newTenantInfo: NewTenantInfoDto;

  @ApiProperty({ example: 'Transferring due to relocation' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
