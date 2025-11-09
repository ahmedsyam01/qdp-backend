import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommitmentReward, CommitmentRewardDocument } from '../../modules/rewards/schemas/commitment-reward.schema';
import { Contract, ContractDocument } from '../../modules/contracts/schemas/contract.schema';

@Injectable()
export class CommitmentRewardSeeder {
  constructor(
    @InjectModel(CommitmentReward.name)
    private rewardModel: Model<CommitmentRewardDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
  ) {}

  async seed() {
    const count = await this.rewardModel.countDocuments();
    if (count > 0) {
      console.log('✅ Commitment rewards already seeded');
      return;
    }

    // Only seed rewards for rental contracts (not sale contracts)
    const rentalContracts = await this.contractModel.find({
      contractType: 'rent',
      status: { $in: ['active', 'completed'] },
    });

    if (rentalContracts.length === 0) {
      console.log('⚠️ No rental contracts found. Please seed contracts first.');
      return;
    }

    const rewards = [];

    for (const contract of rentalContracts) {
      // Calculate total payments based on contract duration
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);
      const monthsDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );
      const totalPayments = monthsDiff;

      // Generate random progress scenarios:
      // 30% have perfect record (all payments on time)
      // 40% are in progress with good payment history
      // 20% have late payments (forfeited)
      // 10% have missed payments (forfeited)
      const scenario = Math.random();

      let paymentsOnTime: number;
      let latePayments: number;
      let missedPayments: number;
      let rewardStatus: string;
      let isEligible: boolean;
      let earnedAt: Date | null;
      let forfeitedAt: Date | null;
      let forfeitReason: string | null;

      if (scenario < 0.3) {
        // Perfect record - all payments on time
        paymentsOnTime = totalPayments;
        latePayments = 0;
        missedPayments = 0;
        rewardStatus = 'earned';
        isEligible = true;
        earnedAt = new Date();
        forfeitedAt = null;
        forfeitReason = null;
      } else if (scenario < 0.7) {
        // In progress - some payments made on time
        paymentsOnTime = Math.floor(Math.random() * totalPayments);
        latePayments = 0;
        missedPayments = 0;
        rewardStatus = 'earning';
        isEligible = false;
        earnedAt = null;
        forfeitedAt = null;
        forfeitReason = null;
      } else if (scenario < 0.9) {
        // Late payments - reward forfeited
        paymentsOnTime = Math.floor(Math.random() * totalPayments);
        latePayments = Math.floor(Math.random() * 3) + 1;
        missedPayments = 0;
        rewardStatus = 'forfeited';
        isEligible = false;
        earnedAt = null;
        forfeitedAt = new Date();
        forfeitReason = 'تم الدفع بعد الموعد المحدد';
      } else {
        // Missed payments - reward forfeited
        paymentsOnTime = Math.floor(Math.random() * totalPayments);
        latePayments = 0;
        missedPayments = Math.floor(Math.random() * 2) + 1;
        rewardStatus = 'forfeited';
        isEligible = false;
        earnedAt = null;
        forfeitedAt = new Date();
        forfeitReason = 'فاتتك دفعة واحدة أو أكثر';
      }

      // Generate payment history for payments made on time
      const paymentHistory = [];
      for (let i = 0; i < paymentsOnTime; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        // Paid 0-5 days early
        const paidDate = new Date(dueDate);
        paidDate.setDate(paidDate.getDate() - Math.floor(Math.random() * 5));

        paymentHistory.push({
          paymentNumber: i + 1,
          dueDate,
          paidDate,
          amount: contract.amount,
          isOnTime: true,
        });
      }

      // Add late payment history if applicable
      for (let i = 0; i < latePayments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + paymentsOnTime + i);

        // Paid 1-10 days late
        const paidDate = new Date(dueDate);
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 10) + 1);

        paymentHistory.push({
          paymentNumber: paymentsOnTime + i + 1,
          dueDate,
          paidDate,
          amount: contract.amount,
          isOnTime: false,
        });
      }

      rewards.push({
        contractId: contract._id,
        userId: contract.tenantId,
        totalPayments,
        paymentsOnTime,
        latePayments,
        missedPayments,
        rewardStatus,
        rewardValue: 'شهر مجاني',
        rewardDescription:
          'إذا التزم المستأجر بسداد الايجار في موعده دون تأخير طوال مدة العقد، يحصل على شهر مجاني في نهاية المدة أو عند التجديد.',
        isEligible,
        earnedAt,
        forfeitedAt,
        forfeitReason,
        paymentHistory,
      });
    }

    await this.rewardModel.insertMany(rewards);
    console.log(
      `✅ Commitment rewards seeded successfully (${rewards.length} rewards)`,
    );

    // Print summary statistics
    const earning = rewards.filter((r) => r.rewardStatus === 'earning').length;
    const earned = rewards.filter((r) => r.rewardStatus === 'earned').length;
    const forfeited = rewards.filter((r) => r.rewardStatus === 'forfeited')
      .length;

    console.log(`   - Earning: ${earning}`);
    console.log(`   - Earned: ${earned}`);
    console.log(`   - Forfeited: ${forfeited}`);
  }
}
