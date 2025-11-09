import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyListingDocument = PropertyListing & Document;

@Schema({ timestamps: true })
export class PropertyListing {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['7_days', '15_days', '30_days', '90_days'],
    default: '7_days'
  })
  adDuration: string;

  @Prop({ required: true, default: 20 })
  evaluationFee: number; // تكلفة تقييم العقار - Fixed: 20 QR

  @Prop({ required: true })
  displayFee: number; // تكلفة ظهور الإعلان (varies by duration)

  @Prop({ required: true })
  totalCost: number; // evaluationFee + displayFee

  @Prop({
    enum: ['pending', 'active', 'expired', 'cancelled', 'rejected'],
    default: 'pending'
  })
  status: string;

  @Prop({ required: false })
  publishedAt?: Date;

  @Prop({ required: false })
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  rejectionReason: string;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: 0 })
  contactsCount: number;
}

export const PropertyListingSchema = SchemaFactory.createForClass(PropertyListing);

// Indexes for better query performance
PropertyListingSchema.index({ propertyId: 1 });
PropertyListingSchema.index({ userId: 1, status: 1 });
PropertyListingSchema.index({ status: 1, expiresAt: 1 });
PropertyListingSchema.index({ publishedAt: -1 });
