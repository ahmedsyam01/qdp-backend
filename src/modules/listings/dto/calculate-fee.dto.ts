import { IsEnum, IsNotEmpty } from 'class-validator';

export class CalculateFeeDto {
  @IsEnum(['7_days', '15_days', '30_days', '90_days'])
  @IsNotEmpty()
  adDuration: '7_days' | '15_days' | '30_days' | '90_days';
}
