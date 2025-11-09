import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTransfersDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by user name, property name

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'completed', 'awaiting_info'])
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

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
}
