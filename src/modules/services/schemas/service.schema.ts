import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Property' })
  propertyId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['furniture', 'plumbing', 'electrical', 'ac'],
  })
  serviceType: string; // صيانة الأثاث, صيانة السباكة, صيانة الكهرباء, صيانة التكييف

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ default: Date.now })
  requestDate: Date;

  @Prop()
  scheduledDate: Date;

  @Prop()
  completionDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Technician' })
  technicianId: Types.ObjectId; // Service provider/technician assigned

  @Prop()
  technicianName: string; // Cached for performance

  @Prop()
  cost: number;

  @Prop()
  estimatedCost: number;

  @Prop({ type: [String], default: [] })
  images: string[]; // Photos of issue

  @Prop({ min: 1, max: 5 })
  rating: number; // 1-5 stars

  @Prop()
  feedback: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes for performance optimization
ServiceSchema.index({ userId: 1, status: 1 });
ServiceSchema.index({ serviceType: 1 });
ServiceSchema.index({ technicianId: 1 });
ServiceSchema.index({ requestDate: -1 });
ServiceSchema.index({ status: 1, requestDate: -1 });
