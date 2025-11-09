import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPropertiesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['pending', 'active', 'sold', 'rented', 'archived', 'rejected'])
  status?: string;

  @IsOptional()
  @IsEnum(['apartment', 'villa', 'office', 'land', 'warehouse', 'showroom'])
  propertyType?: string;

  @IsOptional()
  @IsEnum(['sale', 'rent'])
  category?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxArea?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(['rent', 'sale', 'both'])
  availableFor?: string; // Filter by availability type

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
