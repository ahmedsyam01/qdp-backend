import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { ListingsService } from '../listings/listings.service';
import { BookingsService } from '../bookings/bookings.service';
import { ContractsService } from '../contracts/contracts.service';
import { PropertyBooking } from '../bookings/schemas/property-booking.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(PropertyBooking.name) private bookingModel: Model<PropertyBooking>,
    private promoCodesService: PromoCodesService,
    private listingsService: ListingsService,
    private bookingsService: BookingsService,
    private contractsService: ContractsService,
    private configService: ConfigService,
  ) {
    // Initialize Stripe only if API key is provided
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-09-30.clover',
      });
    }
  }

  /**
   * Process payment with Stripe or other gateways
   */
  async processPayment(
    userId: string,
    processPaymentDto: ProcessPaymentDto,
  ): Promise<PaymentDocument> {
    const {
      amount,
      paymentMethod,
      paymentType,
      referenceId,
      promoCode,
      insuranceFee = 0,
      cardDetails,
      currency = 'QAR',
    } = processPaymentDto;

    let discount = 0;
    let finalAmount = amount;

    // Validate and apply promo code if provided
    if (promoCode) {
      const promoValidation = await this.promoCodesService.validateAndCalculateDiscount({
        code: promoCode,
        purchaseAmount: amount,
        paymentType,
      });

      if (!promoValidation.isValid) {
        throw new BadRequestException(promoValidation.messageAr || promoValidation.message);
      }

      discount = promoValidation.discount;
    }

    // Calculate total amount: amount - discount + insurance
    const totalAmount = amount - discount + insuranceFee;

    if (totalAmount < 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    // Create payment record
    const payment = new this.paymentModel({
      userId,
      amount,
      discount,
      insuranceFee,
      totalAmount,
      currency,
      paymentMethod,
      promoCode,
      paymentType,
      referenceId,
      status: 'processing',
    });

    try {
      // Process payment based on method
      let paymentIntent: any;

      switch (paymentMethod) {
        case 'card':
        case 'visa':
        case 'mastercard':
          // Process card payment with Stripe
          if (!cardDetails) {
            throw new BadRequestException('Card details are required');
          }

          paymentIntent = await this.processStripePayment(
            totalAmount,
            currency,
            cardDetails,
            (payment as any)._id.toString(),
          );

          payment.transactionId = paymentIntent.id;
          payment.paymentGatewayResponse = paymentIntent;
          payment.cardDetails = {
            last4: cardDetails.cardNumber.slice(-4),
            brand: this.detectCardBrand(cardDetails.cardNumber),
            expiryMonth: cardDetails.expiryMonth,
            expiryYear: cardDetails.expiryYear,
          };
          break;

        case 'apple_pay':
        case 'google_pay':
          // For Apple Pay and Google Pay, integrate with Stripe Payment Request API
          // This is a simplified implementation - actual implementation would use tokenization
          paymentIntent = await this.processDigitalWalletPayment(
            totalAmount,
            currency,
            paymentMethod,
            (payment as any)._id.toString(),
          );

          payment.transactionId = paymentIntent.id;
          payment.paymentGatewayResponse = paymentIntent;
          break;

        case 'paypal':
          // PayPal integration would go here
          // For now, mark as pending for manual processing
          payment.status = 'pending';
          payment.transactionId = `PAYPAL_${Date.now()}`;
          break;

        default:
          throw new BadRequestException('Unsupported payment method');
      }

      // Mark payment as completed
      payment.status = 'completed';
      payment.paidAt = new Date();

      await payment.save();

      // Increment promo code usage if applied
      if (promoCode) {
        await this.promoCodesService.incrementUsage(promoCode);
      }

      // Update related entity based on payment type
      await this.updateRelatedEntity(paymentType, referenceId, (payment as any)._id.toString());

      return payment;
    } catch (error) {
      // Mark payment as failed
      payment.status = 'failed';
      payment.paymentGatewayResponse = {
        error: error.message,
        details: error.toString(),
      };
      await payment.save();

      throw new BadRequestException(
        `Payment failed: ${error.message || 'Unknown error occurred'}`,
      );
    }
  }

  /**
   * Process Stripe payment
   * Note: In production, use Stripe Elements/PaymentMethods API for secure tokenization
   * This is a simplified implementation for development
   */
  private async processStripePayment(
    amount: number,
    currency: string,
    cardDetails: any,
    paymentId: string,
  ): Promise<any> {
    // If Stripe is not configured, use mock payment for development
    if (!this.stripe) {
      return this.processMockPayment(amount, currency, cardDetails, paymentId);
    }

    try {
      // Convert QAR to smallest currency unit (dirhams)
      const amountInSmallestUnit = Math.round(amount * 100);

      // Create payment method first (secure way)
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardDetails.cardNumber,
          exp_month: parseInt(cardDetails.expiryMonth),
          exp_year: parseInt(cardDetails.expiryYear),
          cvc: cardDetails.cvv,
        },
      });

      // Create payment intent with payment method
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        payment_method: paymentMethod.id,
        confirm: true,
        metadata: {
          paymentId,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }

  /**
   * Mock payment processor for development/testing
   */
  private async processMockPayment(
    amount: number,
    currency: string,
    cardDetails: any,
    paymentId: string,
  ): Promise<any> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful payment intent
    return {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'succeeded',
      payment_method: {
        id: `pm_mock_${Math.random().toString(36).substr(2, 9)}`,
        type: 'card',
        card: {
          brand: this.detectCardBrand(cardDetails.cardNumber).toLowerCase(),
          last4: cardDetails.cardNumber.slice(-4),
          exp_month: parseInt(cardDetails.expiryMonth),
          exp_year: parseInt(cardDetails.expiryYear),
        },
      },
      metadata: {
        paymentId,
        mode: 'mock',
      },
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Process digital wallet payment (Apple Pay / Google Pay)
   */
  private async processDigitalWalletPayment(
    amount: number,
    currency: string,
    walletType: string,
    paymentId: string,
  ): Promise<any> {
    // If Stripe is not configured, use mock payment for development
    if (!this.stripe) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        status: 'succeeded',
        payment_method: walletType,
        metadata: {
          paymentId,
          walletType,
          mode: 'mock',
        },
        created: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const amountInSmallestUnit = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        payment_method_types: [walletType === 'apple_pay' ? 'card' : 'card'], // Simplified
        metadata: {
          paymentId,
          walletType,
        },
      });

      return paymentIntent;
    } catch (error) {
      throw new Error(`${walletType} payment failed: ${error.message}`);
    }
  }

  /**
   * Detect card brand from card number
   */
  private detectCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';

    return 'Unknown';
  }

  /**
   * Update related entity after successful payment
   */
  private async updateRelatedEntity(
    paymentType: string,
    referenceId: string,
    paymentId: string,
  ): Promise<void> {
    switch (paymentType) {
      case 'listing':
        // Mark property listing as paid
        await this.listingsService.markAsPaid(referenceId, paymentId);
        break;

      case 'contract':
        // Booking is already created by ContractsService when contract is created
        // No additional booking creation needed here
        break;

      // Add other payment types as needed
      case 'booking':
      case 'appliance_rental':
      case 'service':
        // These would be handled by their respective services
        break;

      default:
        break;
    }
  }


  /**
   * Get payment by ID
   */
  async findById(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('userId', 'fullName email phone')
      .exec();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get user's payment history
   */
  async findByUser(userId: string, filters?: any): Promise<PaymentDocument[]> {
    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.paymentType) {
      query.paymentType = filters.paymentType;
    }

    return this.paymentModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Refund payment
   */
  async refund(paymentId: string, reason?: string): Promise<PaymentDocument> {
    const payment = await this.findById(paymentId);

    if (payment.status !== 'completed') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    try {
      // Process refund with Stripe if applicable
      if (payment.transactionId && payment.transactionId.startsWith('pi_')) {
        await this.stripe.refunds.create({
          payment_intent: payment.transactionId,
        });
      }

      // Update payment record
      payment.status = 'refunded';
      payment.refundedAt = new Date();
      payment.refundAmount = payment.totalAmount;
      if (reason) {
        payment.refundReason = reason;
      }

      return payment.save();
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Cancel pending payment
   */
  async cancel(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.findById(paymentId);

    if (payment.status !== 'pending' && payment.status !== 'processing') {
      throw new BadRequestException('Only pending/processing payments can be cancelled');
    }

    payment.status = 'cancelled';
    return payment.save();
  }
}
