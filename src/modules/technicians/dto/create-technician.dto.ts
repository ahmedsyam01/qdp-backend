import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(2)
  nameAr: string;

  @IsString()
  @MinLength(2)
  nameEn: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['furniture', 'plumbing', 'electrical', 'ac', 'other'])
  specialization: string;

  @IsString()
  @IsOptional()
  customSpecialization?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsEnum(['active', 'inactive', 'busy'])
  @IsOptional()
  status?: string;
}
