import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromoCodeDocument = PromoCode & Document;

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ enum: ['percentage', 'fixed'], required: true })
  discountType: string;

  @Prop({ required: true })
  discountValue: number; // percentage (10) or fixed amount (50)

  @Prop({ default: 0 })
  minPurchaseAmount: number;

  @Prop()
  maxDiscountAmount: number; // Max discount for percentage type

  @Prop()
  validFrom: Date;

  @Prop()
  validUntil: Date;

  @Prop()
  usageLimit: number; // Total uses allowed

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'all', enum: ['all', 'listing', 'booking', 'appliance_rental', 'service'] })
  applicableFor: string; // Which payment types this promo applies to

  @Prop()
  description: string;

  @Prop()
  descriptionAr: string;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);

// Indexes for better query performance
// Note: code field already has unique index from @Prop({unique: true})
PromoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
