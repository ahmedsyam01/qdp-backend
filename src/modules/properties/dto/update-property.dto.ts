import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsOptional()
  @IsEnum(['pending', 'active', 'sold', 'rented', 'archived', 'rejected'])
  status?: string;
}
