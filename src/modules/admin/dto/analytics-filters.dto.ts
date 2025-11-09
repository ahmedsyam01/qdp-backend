import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';

export class AnalyticsFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsString()
  paymentType?: string;
}
