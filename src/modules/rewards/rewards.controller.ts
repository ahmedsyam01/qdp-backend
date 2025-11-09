import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * GET /api/rewards/user
   * Get all commitment rewards for current user
   */
  @Get('user')
  async getByUser(@CurrentUser() user: any) {
    return this.rewardsService.getByUser(user.sub);
  }

  /**
   * GET /api/rewards/user/statistics
   * Get reward statistics for current user
   */
  @Get('user/statistics')
  async getUserStatistics(@CurrentUser() user: any) {
    return this.rewardsService.getRewardStatistics(user.sub);
  }

  /**
   * GET /api/rewards/contract/:contractId
   * Get commitment reward by contract ID
   */
  @Get('contract/:contractId')
  async getByContract(@Param('contractId') contractId: string) {
    return this.rewardsService.getByContract(contractId);
  }

  /**
   * GET /api/rewards/contract/:contractId/progress
   * Get reward progress for a contract
   */
  @Get('contract/:contractId/progress')
  async getProgress(@Param('contractId') contractId: string) {
    return this.rewardsService.getProgress(contractId);
  }

  /**
   * POST /api/rewards
   * Create a new commitment reward
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardsService.createForContract(
      createRewardDto.contractId,
      createRewardDto.userId,
      createRewardDto.totalPayments,
    );
  }

  /**
   * POST /api/rewards/contract/:contractId/payment
   * Record a payment for a contract
   */
  @Post('contract/:contractId/payment')
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @Param('contractId') contractId: string,
    @Body() recordPaymentDto: RecordPaymentDto,
  ) {
    return this.rewardsService.recordPayment(contractId, recordPaymentDto);
  }

  /**
   * POST /api/rewards/contract/:contractId/missed
   * Record a missed payment for a contract
   */
  @Post('contract/:contractId/missed')
  @HttpCode(HttpStatus.OK)
  async recordMissedPayment(@Param('contractId') contractId: string) {
    return this.rewardsService.recordMissedPayment(contractId);
  }

  /**
   * POST /api/rewards/:id/claim
   * Claim a reward
   */
  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  async claimReward(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rewardsService.claimReward(id, user.sub);
  }
}
