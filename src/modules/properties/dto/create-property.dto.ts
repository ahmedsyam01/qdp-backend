import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Define CoordinatesDto first
class CoordinatesDto {
  @IsString()
  type: string;

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

class SpecificationsDto {
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  livingRooms?: number;

  @IsNumber()
  areaSqm: number;

  @IsOptional()
  @IsNumber()
  floorNumber?: number;

  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @IsOptional()
  @IsNumber()
  parkingSpaces?: number;

  @IsOptional()
  @IsEnum(['furnished', 'semi-furnished', 'unfurnished'])
  furnishingStatus?: string;
}

class LocationDto {
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;
}

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['apartment', 'villa', 'office', 'land', 'warehouse', 'showroom'])
  propertyType: string;

  @IsEnum(['sale', 'rent'])
  category: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications: SpecificationsDto;

  @IsOptional()
  @IsEnum(['new', 'excellent', 'good', 'fair'])
  propertyCondition?: string;

  @IsOptional()
  @IsString()
  facade?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;
}
