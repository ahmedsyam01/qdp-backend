import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PropertyBooking,
  PropertyBookingSchema,
} from './schemas/property-booking.schema';
import {
  PropertyTransfer,
  PropertyTransferSchema,
} from './schemas/property-transfer.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';
import { Property, PropertySchema } from '../properties/schemas/property.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyBooking.name, schema: PropertyBookingSchema },
      { name: PropertyTransfer.name, schema: PropertyTransferSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [MongooseModule, BookingsService],
})
export class BookingsModule {}
