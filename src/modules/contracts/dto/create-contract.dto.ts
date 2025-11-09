import {
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateContractDto {
  @IsNotEmpty()
  @IsMongoId()
  propertyId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  tenantId: Types.ObjectId; // buyer for sale, tenant for rent

  @IsNotEmpty()
  @IsMongoId()
  landlordId: Types.ObjectId; // seller for sale, landlord for rent

  @IsNotEmpty()
  @IsEnum(['rent', 'sale'])
  contractType: 'rent' | 'sale';

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date; // Required for rental contracts

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number; // Monthly rent or total sale price

  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePayment?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  numberOfChecks?: number; // For rental contracts

  @IsOptional()
  @IsNumber()
  @Min(0)
  insuranceAmount?: number; // Security deposit

  @IsOptional()
  @IsBoolean()
  loyaltyBonus?: boolean; // مكافأة الالتزام

  @IsOptional()
  @IsBoolean()
  allowUnitTransfer?: boolean; // تغيير المجمع السكني
}
