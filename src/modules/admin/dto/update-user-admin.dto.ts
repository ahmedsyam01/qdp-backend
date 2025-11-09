import { IsString, IsEmail, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['buyer', 'seller', 'agent', 'admin', 'super_admin'])
  userType?: string;

  @IsOptional()
  @IsObject()
  adminPermissions?: {
    users?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
    properties?: { view?: boolean; approve?: boolean; edit?: boolean; delete?: boolean };
    appointments?: { view?: boolean; manage?: boolean };
    payments?: { view?: boolean; refund?: boolean };
    analytics?: { view?: boolean; export?: boolean };
    settings?: { view?: boolean; edit?: boolean };
  };

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsEnum(['en', 'ar'])
  languagePreference?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;
}
