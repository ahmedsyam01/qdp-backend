import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class RentalPricesDto {
  @IsNumber()
  @IsNotEmpty()
  oneMonth: number;

  @IsNumber()
  @IsNotEmpty()
  sixMonths: number;

  @IsNumber()
  @IsNotEmpty()
  oneYear: number;
}

export class CreateApplianceDto {
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @IsEnum(['refrigerator', 'tv', 'washing_machine', 'ac', 'oven', 'microwave', 'dishwasher'])
  @IsNotEmpty()
  applianceType: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @IsString()
  @IsNotEmpty()
  descriptionAr: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ValidateNested()
  @Type(() => RentalPricesDto)
  @IsNotEmpty()
  rentalPrices: RentalPricesDto;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  ownerId?: string;
}
