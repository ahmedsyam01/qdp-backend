import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['percentage', 'fixed'])
  @IsNotEmpty()
  discountType: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['all', 'listing', 'booking', 'appliance_rental', 'service'])
  applicableFor?: 'all' | 'listing' | 'booking' | 'appliance_rental' | 'service';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;
}
