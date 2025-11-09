import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  insuranceFee: number; // For property rentals/sales (رسوم التأمين)

  @Prop({ required: true })
  totalAmount: number; // amount - discount + insuranceFee

  @Prop({ required: true, default: 'QAR' })
  currency: string; // QAR, USD

  @Prop({
    required: true,
    enum: ['mastercard', 'visa', 'apple_pay', 'google_pay', 'paypal', 'card']
  })
  paymentMethod: string;

  @Prop()
  promoCode: string;

  @Prop({
    enum: ['listing', 'booking', 'appliance_rental', 'service', 'contract'],
    required: true
  })
  paymentType: string;

  @Prop({ type: Types.ObjectId })
  referenceId: Types.ObjectId; // ID of listing/booking/etc

  @Prop({
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop()
  transactionId: string; // From payment gateway (Stripe, PayPal, etc.)

  @Prop({ type: Object })
  paymentGatewayResponse: any;

  @Prop()
  paidAt: Date;

  @Prop()
  refundedAt: Date;

  @Prop()
  refundAmount: number;

  @Prop({ required: false })
  refundReason?: string;

  @Prop({ type: Object })
  cardDetails: {
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
  };
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes for better query performance
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ referenceId: 1, paymentType: 1 });
