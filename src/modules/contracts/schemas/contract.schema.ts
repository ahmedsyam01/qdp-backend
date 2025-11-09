import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  tenantId: Types.ObjectId; // For rent: tenant, For sale: buyer

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  landlordId: Types.ObjectId; // For rent: landlord, For sale: seller

  @Prop({ required: true, enum: ['rent', 'sale'] })
  contractType: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date; // For rental contracts (usually 1-4 years)

  @Prop({ required: true })
  amount: number; // Monthly rent or sale price

  @Prop()
  advancePayment: number; // For rental: typically 1 month advance

  @Prop({ type: [String], required: true })
  terms: string[]; // Array of contract clauses in Arabic/English

  @Prop()
  numberOfChecks: number; // For rental: typically 12-13 checks

  @Prop({ type: Object })
  checkSchedule: {
    frequency: string; // monthly, quarterly, etc.
    count: number;
    firstCheckDate: Date;
  };

  @Prop()
  insuranceAmount: number; // Security deposit (تأمين)

  @Prop()
  penaltyAmount: number; // Late payment penalty

  @Prop()
  electronicSignatureTenant: string; // Base64 or signature URL

  @Prop()
  electronicSignatureLandlord: string;

  @Prop({
    enum: [
      'draft',
      'pending_signature',
      'active',
      'completed',
      'cancelled',
      'terminated',
    ],
    default: 'draft',
  })
  status: string;

  @Prop()
  signedAtTenant: Date;

  @Prop()
  signedAtLandlord: Date;

  @Prop()
  cancellationReason: string;

  @Prop()
  cancelledAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy: Types.ObjectId;

  @Prop()
  cancellationRequestedAt: Date;

  @Prop({ default: false })
  cancellationApproved: boolean;

  // Additional fields for rental contracts
  @Prop()
  loyaltyBonus: boolean; // مكافأة الالتزام - free month on renewal

  @Prop()
  allowUnitTransfer: boolean; // تغيير المجمع السكني - allow move to another unit

  @Prop()
  pdfUrl: string; // Generated PDF contract URL

  @Prop()
  contractNumber: string; // Unique contract identifier
}

export const ContractSchema = SchemaFactory.createForClass(Contract);

// Indexes for performance optimization
ContractSchema.index({ propertyId: 1 });
ContractSchema.index({ tenantId: 1, status: 1 });
ContractSchema.index({ landlordId: 1, status: 1 });
ContractSchema.index({ contractType: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ contractNumber: 1 }, { unique: true, sparse: true });
ContractSchema.index({ startDate: 1, endDate: 1 });

// Pre-save hook to generate contract number
ContractSchema.pre('save', function (next) {
  if (!this.contractNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    this.contractNumber = `QDP-${this.contractType.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  next();
});
