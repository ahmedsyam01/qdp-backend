import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsEnum(['1_month', '6_months', '1_year'])
  @IsNotEmpty()
  rentalDuration: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  timeSlot: string; // "10:00 ص", "12:00 م", "2:00 م", etc.

  @IsString()
  @IsOptional()
  notes?: string;
}
