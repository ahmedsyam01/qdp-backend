import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/process
   * Process a new payment
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  processPayment(@CurrentUser() user: any, @Body() processPaymentDto: ProcessPaymentDto) {
    console.log('[PAYMENT CONTROLLER] Received payment request:', {
      userId: user.userId,
      amount: processPaymentDto.amount,
      paymentType: processPaymentDto.paymentType,
      referenceId: processPaymentDto.referenceId,
    });
    return this.paymentsService.processPayment(user.userId, processPaymentDto);
  }

  /**
   * GET /api/payments/my-payments
   * Get user's payment history
   */
  @Get('my-payments')
  findMyPayments(@CurrentUser() user: any, @Query() filters?: any) {
    return this.paymentsService.findByUser(user.userId, filters);
  }

  /**
   * GET /api/payments/:id
   * Get payment details by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  /**
   * POST /api/payments/:id/refund
   * Request payment refund
   */
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  refund(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.paymentsService.refund(id, reason);
  }

  /**
   * POST /api/payments/:id/cancel
   * Cancel pending payment
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this.paymentsService.cancel(id);
  }
}
