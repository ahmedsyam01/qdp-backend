import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyBookingDocument = PropertyBooking & Document;

@Schema({ timestamps: true })
export class PropertyBooking {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['rent', 'sale'] })
  bookingType: string;

  @Prop({ required: true })
  totalAmount: number;

  // ===== RENT-SPECIFIC FIELDS (للإيجار فقط) =====
  // Installments are ONLY for RENT bookings
  // For SALE bookings, these fields remain empty/null

  @Prop()
  monthlyAmount: number; // الإيجار الشهري (RENT only)

  @Prop()
  numberOfInstallments: number; // عدد الأقساط الشهرية (RENT only - typically 12 for 12 months)

  @Prop()
  insuranceDeposit: number; // التأمين (RENT only)

  // Monthly installment schedule for RENT bookings
  // Empty array for SALE bookings
  @Prop({ type: [Object], default: [] })
  installments: Array<{
    installmentNumber: number; // 1, 2, 3... up to numberOfInstallments
    dueDate: Date; // تاريخ الاستحقاق
    amount: number; // المبلغ (usually equals monthlyAmount)
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod: 'card' | 'cash'; // طريقة الدفع
    paidAt?: Date;
    paidAmount?: number;
    receiptUrl?: string;
    notes?: string;
  }>;

  @Prop({
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date; // للإيجار فقط

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop({ type: Types.ObjectId, ref: 'Contract' })
  contractId: Types.ObjectId; // Contract created after approval

  @Prop({ type: Object })
  userDetails: {
    fullName: string;
    phone: string;
    email: string;
    identityNumber: string;
    currentAddress?: string;
  };

  @Prop()
  adminNotes: string;

  @Prop()
  requestNotes: string; // User's notes when booking
}

export const PropertyBookingSchema =
  SchemaFactory.createForClass(PropertyBooking);

// Create indexes
PropertyBookingSchema.index({ propertyId: 1 });
PropertyBookingSchema.index({ userId: 1 });
PropertyBookingSchema.index({ status: 1 });
PropertyBookingSchema.index({ bookingType: 1 });
PropertyBookingSchema.index({ createdAt: -1 });
PropertyBookingSchema.index({ 'installments.status': 1 });
PropertyBookingSchema.index({ 'installments.dueDate': 1 });
