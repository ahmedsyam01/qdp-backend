import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  identityNumber: string; // Qatar ID or Residence Permit (رقم الهوية)

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop({ unique: true, required: true })
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'buyer', enum: ['buyer', 'seller', 'agent', 'admin', 'super_admin'] })
  userType: string;

  @Prop({ type: Object, default: {} })
  adminPermissions: {
    users?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
    properties?: { view?: boolean; approve?: boolean; edit?: boolean; delete?: boolean };
    appointments?: { view?: boolean; manage?: boolean };
    payments?: { view?: boolean; refund?: boolean };
    analytics?: { view?: boolean; export?: boolean };
    settings?: { view?: boolean; edit?: boolean };
  };

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop()
  profilePicture: string;

  @Prop()
  address: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop({ default: 'en', enum: ['en', 'ar'] })
  languagePreference: string;

  @Prop({ type: Object, default: {} })
  notificationPreferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
    propertyMatches: boolean;
    bookings: boolean;
    appointments: boolean;
    operations: boolean;
    messages: boolean;
    promotions: boolean;
  };

  @Prop()
  fcmToken: string;

  @Prop()
  otp: string;

  @Prop()
  otpExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes are already created by unique: true on phone and email fields
