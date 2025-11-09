import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PropertyFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(['apartment', 'villa', 'office', 'land', 'warehouse', 'showroom'])
  propertyType?: string;

  @IsOptional()
  @IsEnum(['sale', 'rent'])
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxArea?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsEnum(['furnished', 'semi-furnished', 'unfurnished'])
  furnishingStatus?: string;

  @IsOptional()
  @IsEnum(['new', 'excellent', 'good', 'fair'])
  propertyCondition?: string;

  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'date_asc', 'date_desc', 'area_asc', 'area_desc'])
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radiusKm?: number;
}
