import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PropertyBooking, PropertyBookingSchema } from '../bookings/schemas/property-booking.schema';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { ListingsModule } from '../listings/listings.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: PropertyBooking.name, schema: PropertyBookingSchema },
    ]),
    PromoCodesModule, // For promo code validation
    ListingsModule, // For updating listing status after payment
    BookingsModule, // For creating bookings after contract payment
    ContractsModule, // For accessing contract details
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
