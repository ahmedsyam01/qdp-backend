import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsEnum, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsEnum(['confirmed', 'received', 'in_progress', 'agent', 'unconfirmed'])
  status?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cancelledAt?: Date;
}
