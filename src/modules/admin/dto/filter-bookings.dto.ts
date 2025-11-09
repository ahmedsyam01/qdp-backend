import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterBookingsDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by property name, user name

  @IsOptional()
  @IsEnum(['rent', 'sale'])
  bookingType?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
