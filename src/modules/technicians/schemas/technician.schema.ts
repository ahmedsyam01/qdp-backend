import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TechnicianDocument = Technician & Document;

@Schema({ timestamps: true })
export class Technician {
  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({
    required: true,
    enum: ['furniture', 'plumbing', 'electrical', 'ac', 'other'],
  })
  specialization: string;

  @Prop()
  customSpecialization: string; // if specialization is 'other'

  @Prop()
  idNumber: string; // QID or Passport

  @Prop({ default: 0 })
  yearsOfExperience: number;

  @Prop()
  profileImage: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({
    enum: ['active', 'inactive', 'busy'],
    default: 'active',
  })
  status: string;

  @Prop({ default: 0 })
  totalJobs: number;

  @Prop({ default: 0 })
  completedJobs: number;

  @Prop({ default: 0 })
  currentJobs: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ type: [Object], default: [] })
  ratings: Array<{
    userId: Types.ObjectId;
    serviceId: Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }>;

  @Prop({ type: Object })
  metadata: {
    lastAssignedDate?: Date;
    lastCompletedDate?: Date;
    totalRevenue?: number;
  };
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);

// Indexes for performance optimization
TechnicianSchema.index({ specialization: 1, status: 1 });
TechnicianSchema.index({ status: 1 });
TechnicianSchema.index({ averageRating: -1 });
TechnicianSchema.index({ currentJobs: 1 });
TechnicianSchema.index({ phone: 1 }, { unique: true });
TechnicianSchema.index({ nameAr: 'text', nameEn: 'text' });
