import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppliancesController } from './appliances.controller';
import { AppliancesService } from './appliances.service';
import { Appliance, ApplianceSchema } from './schemas/appliance.schema';
import {
  ApplianceBooking,
  ApplianceBookingSchema,
} from './schemas/appliance-booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appliance.name, schema: ApplianceSchema },
      { name: ApplianceBooking.name, schema: ApplianceBookingSchema },
    ]),
  ],
  controllers: [AppliancesController],
  providers: [AppliancesService],
  exports: [AppliancesService],
})
export class AppliancesModule {}
