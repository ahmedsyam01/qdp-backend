import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class RecordPaymentDto {
  @IsNotEmpty()
  @IsDateString()
  dueDate: Date;

  @IsNotEmpty()
  @IsDateString()
  paidDate: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
