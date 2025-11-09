import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class ApprovePropertyDto {
  @IsOptional()
  @IsBoolean()
  setFeatured?: boolean;

  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @IsOptional()
  notes?: string;
}
