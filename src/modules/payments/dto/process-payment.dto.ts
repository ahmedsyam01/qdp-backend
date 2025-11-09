import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CardDetailsDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @IsString()
  @IsNotEmpty()
  expiryMonth: string;

  @IsString()
  @IsNotEmpty()
  expiryYear: string;

  @IsString()
  @IsNotEmpty()
  cvv: string;
}

export class ProcessPaymentDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsEnum(['mastercard', 'visa', 'apple_pay', 'google_pay', 'paypal', 'card'])
  @IsNotEmpty()
  paymentMethod: 'mastercard' | 'visa' | 'apple_pay' | 'google_pay' | 'paypal' | 'card';

  @IsEnum(['listing', 'booking', 'appliance_rental', 'service', 'contract'])
  @IsNotEmpty()
  paymentType: 'listing' | 'booking' | 'appliance_rental' | 'service' | 'contract';

  @IsMongoId()
  @IsNotEmpty()
  referenceId: string;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceFee?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;

  @IsOptional()
  @IsString()
  currency?: string;
}
