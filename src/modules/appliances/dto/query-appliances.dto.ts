import { IsOptional, IsEnum, IsString } from 'class-validator';

export class QueryAppliancesDto {
  @IsOptional()
  @IsEnum(['refrigerator', 'tv', 'washing_machine', 'ac', 'oven', 'microwave', 'dishwasher'])
  applianceType?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
