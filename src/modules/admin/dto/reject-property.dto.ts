import { IsString, IsEnum } from 'class-validator';

export class RejectPropertyDto {
  @IsEnum([
    'incomplete_information',
    'invalid_images',
    'incorrect_pricing',
    'duplicate_listing',
    'violates_policies',
    'other',
  ])
  reason: string;

  @IsString()
  details: string;
}
