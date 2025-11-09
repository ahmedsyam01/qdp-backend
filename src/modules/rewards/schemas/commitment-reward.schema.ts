import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommitmentRewardDocument = CommitmentReward & Document;

@Schema({ timestamps: true })
export class CommitmentReward {
  @Prop({ type: Types.ObjectId, ref: 'Contract', required: true, unique: true })
  contractId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Tenant/buyer

  @Prop({ required: true, default: 0 })
  totalPayments: number; // Total expected payments for contract duration

  @Prop({ required: true, default: 0 })
  paymentsOnTime: number; // Number of payments made on time

  @Prop({ default: 0 })
  latePayments: number; // Number of late payments

  @Prop({ default: 0 })
  missedPayments: number; // Number of missed payments

  @Prop({
    required: true,
    enum: ['earning', 'earned', 'claimed', 'forfeited'],
    default: 'earning',
  })
  rewardStatus: string;

  @Prop({ required: true })
  rewardValue: string; // e.g., "شهر مجاني", "Free month", or amount

  @Prop()
  rewardDescription: string; // Arabic description

  @Prop({ default: false })
  isEligible: boolean; // Calculated: paymentsOnTime === totalPayments

  @Prop()
  earnedAt: Date; // When all payments were completed on time

  @Prop()
  claimedAt: Date; // When reward was redeemed

  @Prop()
  forfeitedAt: Date; // When reward was lost due to late payment

  @Prop()
  forfeitReason: string;

  @Prop({ type: [Object], default: [] })
  paymentHistory: Array<{
    paymentNumber: number;
    dueDate: Date;
    paidDate: Date;
    amount: number;
    isOnTime: boolean;
  }>;
}

export const CommitmentRewardSchema =
  SchemaFactory.createForClass(CommitmentReward);

// Indexes for performance optimization
CommitmentRewardSchema.index({ contractId: 1 });
CommitmentRewardSchema.index({ userId: 1 });
CommitmentRewardSchema.index({ rewardStatus: 1 });
CommitmentRewardSchema.index({ isEligible: 1 });
