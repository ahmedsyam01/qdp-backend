import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyTransferDto {
  @ApiProperty({
    example: '68eda9e216e540a5311107e3',
    description: 'The property ID the user wants to transfer to',
  })
  @IsString()
  @IsNotEmpty()
  requestedPropertyId: string;

  @ApiProperty({
    example: 'The property is closer to my new workplace',
    description: 'Reason for requesting the property transfer',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
