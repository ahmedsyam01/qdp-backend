import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTechniciansDto {
  @IsOptional()
  @IsEnum(['furniture', 'plumbing', 'electrical', 'ac', 'other'])
  specialization?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'busy'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by name, phone, email

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['rating', 'jobs', 'name', 'createdAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
