import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplianceDocument = Appliance & Document;

@Schema({ timestamps: true })
export class Appliance {
  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({
    required: true,
    enum: ['refrigerator', 'tv', 'washing_machine', 'ac', 'oven', 'microwave', 'dishwasher'],
  })
  applianceType: string;

  @Prop({ required: true })
  brand: string; // Samsung, LG, Bosch, etc.

  @Prop()
  model: string;

  @Prop()
  color: string; // Silver, White, Black, etc.

  @Prop({ required: true })
  descriptionEn: string;

  @Prop({ required: true })
  descriptionAr: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Object, required: true })
  rentalPrices: {
    oneMonth: number; // e.g., 80 QR
    sixMonths: number; // e.g., 140 QR
    oneYear: number; // e.g., 200 QR
  };

  // Monthly installment pricing (for admin-managed rentals)
  @Prop({ required: true })
  monthlyPrice: number; // Price per month for custom duration rentals

  @Prop({ required: true, default: 500 })
  deposit: number; // Security deposit

  @Prop({ default: 3 })
  minRentalMonths: number; // Minimum rental duration in months

  @Prop({ default: 24 })
  maxRentalMonths: number; // Maximum rental duration in months

  @Prop({
    enum: ['available', 'rented', 'maintenance', 'inactive'],
    default: 'available',
  })
  status: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ default: 0 })
  viewsCount: number;

  // Rental statistics
  @Prop({ default: 0 })
  totalRentals: number;

  @Prop({ default: 0 })
  totalMonthsRented: number;

  @Prop()
  lastMaintenanceDate: Date;

  @Prop()
  lastRentalDate: Date;

  // Specifications (key-value pairs for admin)
  @Prop({ type: Object, default: {} })
  specifications: Record<string, string>; // e.g., { "سعة": "384 لتر", "اللون": "فضي" }
}

export const ApplianceSchema = SchemaFactory.createForClass(Appliance);

// Indexes
ApplianceSchema.index({ applianceType: 1 });
ApplianceSchema.index({ isAvailable: 1 });
ApplianceSchema.index({ brand: 1 });
