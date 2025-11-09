import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId: Types.ObjectId; // Real estate agent assigned

  @Prop({ required: true, enum: ['viewing', 'delivery'] })
  appointmentType: string; // معاينة or تسليم

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string; // e.g., "10:00 ص", "2:00 م"

  @Prop({
    required: true,
    enum: ['confirmed', 'received', 'in_progress', 'agent', 'unconfirmed'],
    default: 'unconfirmed',
  })
  status: string; // مؤكد, استلم, جاري التنفيذ, وكيل العقارات, غير مؤكد

  @Prop()
  notes: string;

  @Prop({
    type: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
  })
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop()
  completedAt: Date;

  @Prop()
  cancelledAt: Date;

  @Prop()
  cancellationReason: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Indexes for performance
AppointmentSchema.index({ userId: 1, date: -1 });
AppointmentSchema.index({ propertyId: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentType: 1 });
AppointmentSchema.index({ agentId: 1 });
AppointmentSchema.index({ date: 1 });
