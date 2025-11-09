import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyTransferDocument = PropertyTransfer & Document;

@Schema({ timestamps: true })
export class PropertyTransfer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true })
  currentContractId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  currentPropertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  requestedPropertyId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({
    enum: ['pending', 'approved', 'rejected', 'completed', 'awaiting_info'],
    default: 'pending',
  })
  status: string;

  @Prop()
  adminNotes: string;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  @Prop()
  completedAt: Date;

  // Eligibility checks (auto-populated by backend)
  @Prop({ type: Object })
  eligibilityCheck: {
    similarUnitAvailable: boolean;
    noLatePayments: boolean;
    allInstallmentsPaid: boolean;
    message?: string;
  };

  // Payment history snapshot
  @Prop({ type: [Object], default: [] })
  paymentHistory: Array<{
    month: string;
    status: 'on_time' | 'late' | 'missed';
    daysLate?: number;
  }>;

  @Prop()
  requestedMessage: string; // Message to user requesting more info
}

export const PropertyTransferSchema =
  SchemaFactory.createForClass(PropertyTransfer);

// Create indexes
PropertyTransferSchema.index({ userId: 1 });
PropertyTransferSchema.index({ currentContractId: 1 });
PropertyTransferSchema.index({ currentPropertyId: 1 });
PropertyTransferSchema.index({ requestedPropertyId: 1 });
PropertyTransferSchema.index({ status: 1 });
PropertyTransferSchema.index({ createdAt: -1 });
