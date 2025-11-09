import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsString()
  contractId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  totalPayments: number;
}
