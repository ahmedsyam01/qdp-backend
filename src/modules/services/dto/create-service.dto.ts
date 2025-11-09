import { IsString, IsEnum, IsOptional, IsMongoId, IsNumber, IsArray, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateServiceDto {
  @IsOptional()
  @IsMongoId()
  propertyId?: Types.ObjectId;

  @IsEnum(['furniture', 'plumbing', 'electrical', 'ac'])
  serviceType: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
