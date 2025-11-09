import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ type: Types.ObjectId, ref: 'Location' })
  parentId: Types.ObjectId;

  @Prop({ required: true, enum: ['country', 'city', 'area'] })
  type: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Create 2dsphere index for geospatial queries
LocationSchema.index({ coordinates: '2dsphere' });
LocationSchema.index({ type: 1 });
LocationSchema.index({ parentId: 1 });
