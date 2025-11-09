import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'appointment_confirmed',
      'payment_due',
      'property_match',
      'service_completed',
      'contract_expiring',
      'message_received',
    ],
    index: true,
  })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  icon: string; // Icon identifier for frontend

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Object })
  relatedEntity: {
    type: string; // 'property', 'appointment', 'service', 'contract', 'payment', 'message'
    id: Types.ObjectId;
  };

  @Prop()
  actionUrl: string; // Deep link to related screen

  @Prop()
  readAt: Date;

  @Prop({ default: false })
  isPushSent: boolean;

  @Prop()
  pushSentAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });
