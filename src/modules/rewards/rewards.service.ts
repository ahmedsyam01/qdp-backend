import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommitmentReward, CommitmentRewardDocument } from './schemas/commitment-reward.schema';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(CommitmentReward.name)
    private rewardModel: Model<CommitmentRewardDocument>,
  ) {}

  /**
   * Create a commitment reward for a contract
   */
  async createForContract(
    contractId: string,
    userId: string,
    totalPayments: number,
  ) {
    // Check if reward already exists for this contract
    const existing = await this.rewardModel.findOne({ contractId });
    if (existing) {
      throw new BadRequestException(
        'Commitment reward already exists for this contract',
      );
    }

    const reward = new this.rewardModel({
      contractId,
      userId,
      totalPayments,
      paymentsOnTime: 0,
      rewardValue: 'شهر مجاني',
      rewardDescription:
        'إذا التزم المستأجر بسداد الايجار في موعده دون تأخير طوال مدة العقد، يحصل على شهر مجاني في نهاية المدة أو عند التجديد.',
      rewardStatus: 'earning',
    });

    return reward.save();
  }

  /**
   * Record a payment and update reward status
   */
  async recordPayment(contractId: string, paymentData: {
    dueDate: Date;
    paidDate: Date;
    amount: number;
  }) {
    const reward = await this.rewardModel.findOne({ contractId });

    if (!reward) {
      throw new NotFoundException(
        'Commitment reward not found for this contract',
      );
    }

    // Check if payment is on time (paid on or before due date)
    const isOnTime =
      new Date(paymentData.paidDate) <= new Date(paymentData.dueDate);

    // Update payment history
    reward.paymentHistory.push({
      paymentNumber: reward.paymentHistory.length + 1,
      dueDate: paymentData.dueDate,
      paidDate: paymentData.paidDate,
      amount: paymentData.amount,
      isOnTime,
    });

    // Update counters
    if (isOnTime) {
      reward.paymentsOnTime += 1;
    } else {
      reward.latePayments += 1;
      // Forfeit reward if any payment is late
      if (reward.rewardStatus === 'earning') {
        reward.rewardStatus = 'forfeited';
        reward.forfeitedAt = new Date();
        reward.forfeitReason = 'تم الدفع بعد الموعد المحدد';
        reward.isEligible = false;
      }
    }

    // Check if all payments completed on time
    if (
      reward.paymentsOnTime === reward.totalPayments &&
      reward.rewardStatus === 'earning'
    ) {
      reward.rewardStatus = 'earned';
      reward.isEligible = true;
      reward.earnedAt = new Date();
    }

    return reward.save();
  }

  /**
   * Get commitment reward by contract ID
   */
  async getByContract(contractId: string) {
    const reward = await this.rewardModel
      .findOne({ contractId })
      .populate('contractId', 'contractNumber startDate endDate amount')
      .populate('userId', 'fullName phone email')
      .exec();

    if (!reward) {
      throw new NotFoundException(
        'Commitment reward not found for this contract',
      );
    }

    return reward;
  }

  /**
   * Get all commitment rewards for a user
   */
  async getByUser(userId: string) {
    return this.rewardModel
      .find({ userId })
      .populate('contractId', 'contractNumber propertyId startDate endDate amount contractType')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get reward progress for a contract
   */
  async getProgress(contractId: string) {
    const reward = await this.rewardModel.findOne({ contractId });

    if (!reward) {
      return null;
    }

    return {
      totalPayments: reward.totalPayments,
      paymentsOnTime: reward.paymentsOnTime,
      latePayments: reward.latePayments,
      missedPayments: reward.missedPayments,
      progressPercent: Math.round(
        (reward.paymentsOnTime / reward.totalPayments) * 100,
      ),
      rewardStatus: reward.rewardStatus,
      isEligible: reward.isEligible,
      rewardValue: reward.rewardValue,
      rewardDescription: reward.rewardDescription,
    };
  }

  /**
   * Claim a reward
   */
  async claimReward(rewardId: string, userId: string) {
    const reward = await this.rewardModel.findById(rewardId);

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    // Verify the reward belongs to the user
    if (reward.userId.toString() !== userId) {
      throw new BadRequestException('You are not authorized to claim this reward');
    }

    if (reward.rewardStatus !== 'earned') {
      throw new BadRequestException('Reward is not eligible to be claimed');
    }

    reward.rewardStatus = 'claimed';
    reward.claimedAt = new Date();

    return reward.save();
  }

  /**
   * Get all rewards with statistics
   */
  async getRewardStatistics(userId: string) {
    const rewards = await this.rewardModel.find({ userId });

    const stats = {
      total: rewards.length,
      earning: rewards.filter((r) => r.rewardStatus === 'earning').length,
      earned: rewards.filter((r) => r.rewardStatus === 'earned').length,
      claimed: rewards.filter((r) => r.rewardStatus === 'claimed').length,
      forfeited: rewards.filter((r) => r.rewardStatus === 'forfeited').length,
      totalPaymentsOnTime: rewards.reduce((sum, r) => sum + r.paymentsOnTime, 0),
      totalLatePayments: rewards.reduce((sum, r) => sum + r.latePayments, 0),
    };

    return stats;
  }

  /**
   * Mark a payment as missed
   */
  async recordMissedPayment(contractId: string) {
    const reward = await this.rewardModel.findOne({ contractId });

    if (!reward) {
      throw new NotFoundException(
        'Commitment reward not found for this contract',
      );
    }

    reward.missedPayments += 1;

    // Forfeit reward if any payment is missed
    if (reward.rewardStatus === 'earning') {
      reward.rewardStatus = 'forfeited';
      reward.forfeitedAt = new Date();
      reward.forfeitReason = 'فاتتك دفعة واحدة أو أكثر';
      reward.isEligible = false;
    }

    return reward.save();
  }
}
