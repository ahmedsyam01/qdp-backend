import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class FilterUsersDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name, phone, email, ID number

  @IsOptional()
  @IsEnum(['buyer', 'seller', 'agent', 'admin', 'super_admin'])
  userType?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string; // Registration date range

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  verified?: string; // 'true' or 'false'

  @IsOptional()
  @IsString()
  page?: string; // For pagination

  @IsOptional()
  @IsString()
  limit?: string; // Items per page

  @IsOptional()
  @IsString()
  sortBy?: string; // Field to sort by

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
