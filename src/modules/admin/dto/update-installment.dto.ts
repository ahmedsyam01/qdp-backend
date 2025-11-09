import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';

export class UpdateInstallmentDto {
  @IsOptional()
  @IsEnum(['card', 'cash'])
  paymentMethod?: 'card' | 'cash';

  @IsOptional()
  @IsEnum(['pending', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkInstallmentPaidDto {
  @IsNumber()
  paidAmount: number;

  @IsOptional()
  @IsString()
  paidAt?: string; // ISO date string

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
