import { IsNotEmpty, IsString, IsEnum, IsDate, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class LocationDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsNotEmpty()
  @IsEnum(['viewing', 'delivery'])
  appointmentType: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsOptional()
  @IsEnum(['confirmed', 'received', 'in_progress', 'agent', 'unconfirmed'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}
