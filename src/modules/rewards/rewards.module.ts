import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import {
  CommitmentReward,
  CommitmentRewardSchema,
} from './schemas/commitment-reward.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommitmentReward.name, schema: CommitmentRewardSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
