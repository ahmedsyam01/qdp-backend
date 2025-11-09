import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class RateServiceDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
