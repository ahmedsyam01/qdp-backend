import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateListingDto {
  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;

  @IsEnum(['7_days', '15_days', '30_days', '90_days'])
  @IsNotEmpty()
  adDuration: '7_days' | '15_days' | '30_days' | '90_days';

  @IsOptional()
  @IsNumber()
  evaluationFee?: number;

  @IsOptional()
  @IsNumber()
  displayFee?: number;

  @IsOptional()
  @IsNumber()
  totalCost?: number;
}
