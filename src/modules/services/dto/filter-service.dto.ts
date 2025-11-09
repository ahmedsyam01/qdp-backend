import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class FilterServiceDto {
  @IsOptional()
  @IsEnum(['furniture', 'plumbing', 'electrical', 'ac'])
  serviceType?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  propertyId?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  technicianId?: Types.ObjectId;
}
