import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AmenityDocument = Amenity & Document;

@Schema({ timestamps: true })
export class Amenity {
  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop()
  icon: string;

  @Prop({
    required: true,
    enum: ['security', 'recreation', 'services', 'utilities', 'facilities'],
  })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity);

// Indexes
AmenitySchema.index({ category: 1 });
AmenitySchema.index({ isActive: 1 });
