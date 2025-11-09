import { IsString, IsEnum, IsOptional, IsMongoId, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledDate?: Date;

  @IsOptional()
  @IsMongoId()
  technicianId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
