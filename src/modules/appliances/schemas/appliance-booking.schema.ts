import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplianceBookingDocument = ApplianceBooking & Document;

@Schema({ timestamps: true })
export class ApplianceBooking {
  @Prop({ type: Types.ObjectId, ref: 'Appliance', required: true })
  applianceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['1_month', '6_months', '1_year', 'custom'] })
  rentalDuration: string;

  // For custom duration rentals (admin-managed monthly installments)
  @Prop()
  durationMonths: number; // Number of months for custom rentals

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  timeSlot: string; // "10:00 ص", "12:00 م", "2:00 م", "4:00 م", "6:00 م", "8:00 م", "10:00 م"

  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  monthlyAmount: number; // Monthly rental amount (for custom duration)

  @Prop()
  deposit: number; // Security deposit

  // Installments tracking (for custom duration rentals)
  @Prop({ type: [Object], default: [] })
  installments: Array<{
    installmentNumber: number;
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod: 'card' | 'cash';
    paidAt?: Date;
    paidAmount?: number;
    paymentId?: string; // Reference to payment transaction
  }>;

  @Prop()
  deliveryAddress: string;

  @Prop()
  notes: string;

  @Prop({
    enum: ['pending', 'confirmed', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId; // Admin who approved

  @Prop()
  approvedAt: Date;

  @Prop()
  rejectedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop()
  cancelledAt: Date;

  @Prop()
  cancellationReason: string;
}

export const ApplianceBookingSchema = SchemaFactory.createForClass(ApplianceBooking);

// Indexes
ApplianceBookingSchema.index({ userId: 1, status: 1 });
ApplianceBookingSchema.index({ applianceId: 1, status: 1 });
ApplianceBookingSchema.index({ startDate: 1, endDate: 1 });
