import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelContractDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Cancellation reason must be at least 10 characters' })
  cancellationReason: string;
}

export class ApproveCancellationDto {
  @IsNotEmpty()
  approved: boolean; // true to approve, false to reject
}
