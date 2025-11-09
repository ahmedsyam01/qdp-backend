import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { PropertyBooking, PropertyBookingSchema } from '../bookings/schemas/property-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
      { name: PropertyBooking.name, schema: PropertyBookingSchema },
    ]),
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
