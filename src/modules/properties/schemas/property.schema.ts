import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['apartment', 'villa', 'office', 'land', 'warehouse', 'showroom'],
  })
  propertyType: string;

  @Prop({ required: true, enum: ['sale', 'rent'] })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'QAR' })
  currency: string;

  // Dual Purpose Support: Property can be available for rent, sale, or both
  @Prop({ type: Object, required: true })
  availableFor: {
    rent: boolean; // متاح للإيجار
    sale: boolean; // متاح للبيع
    rentPrice?: number; // سعر الإيجار الشهري
    salePrice?: number; // سعر البيع
    contractDuration?: number; // مدة العقد بالأشهر (للإيجار)
    numberOfInstallments?: number; // عدد الأقساط
    insuranceDeposit?: number; // التأمين (للإيجار)
  };

  @Prop({ type: Object })
  specifications: {
    bedrooms?: number;
    bathrooms?: number;
    livingRooms?: number; // عدد الصالات
    areaSqm: number;
    floorNumber?: number;
    totalFloors?: number;
    parkingSpaces?: number;
    furnishingStatus?: string; // 'furnished', 'semi-furnished', 'unfurnished'
  };

  @Prop({ enum: ['new', 'excellent', 'good', 'fair'] })
  propertyCondition: string; // حالة العقار

  @Prop()
  facade: string; // الواجهة (north, south, east, west, multiple)

  @Prop({ type: Object, required: true })
  location: {
    address: string;
    city: string;
    area: string;
    building?: string;
    landmark?: string;
    coordinates: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };

  @Prop({ type: [Object], default: [] })
  images: Array<{
    url: string;
    isCover: boolean;
    order: number;
  }>;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({
    default: 'pending',
    enum: ['pending', 'active', 'sold', 'rented', 'archived', 'rejected'],
  })
  status: string;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ type: Date })
  publishedAt: Date;

  @Prop()
  videoUrl: string;

  @Prop({ default: true })
  allowComments: boolean;

  @Prop({ default: true })
  allowMessages: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

// Create indexes for performance optimization
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ propertyType: 1, category: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ status: 1 });
PropertySchema.index({ userId: 1 });
PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ 'specifications.bedrooms': 1 });
PropertySchema.index({ 'specifications.bathrooms': 1 });
PropertySchema.index({ 'specifications.areaSqm': 1 });
PropertySchema.index({ 'location.city': 1, 'location.area': 1 });

// Text index for search
PropertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
  'location.area': 'text',
});
