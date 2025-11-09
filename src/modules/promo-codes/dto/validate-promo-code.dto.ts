import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  purchaseAmount: number;

  @IsOptional()
  @IsString()
  paymentType?: string;
}
