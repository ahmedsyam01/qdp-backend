import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class SignContractDto {
  @IsNotEmpty()
  @IsString()
  signature: string; // Base64 encoded signature or signature URL

  @IsNotEmpty()
  @IsEnum(['tenant', 'landlord'])
  signerRole: 'tenant' | 'landlord'; // Who is signing (tenant/buyer or landlord/seller)
}
