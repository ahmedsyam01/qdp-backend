import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Compound unique index to ensure a user can only favorite a property once
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1 });
FavoriteSchema.index({ propertyId: 1 });
