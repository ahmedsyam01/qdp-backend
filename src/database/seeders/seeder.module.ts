import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database.module';
import { UserSeeder } from './user.seeder';
import { AdminUserSeeder } from './admin-user.seeder';
import { LocationSeeder } from './location.seeder';
import { AmenitySeeder } from './amenity.seeder';
import { PropertySeeder } from './property.seeder';
import { ContractSeeder } from './contract.seeder';
import { PromoCodeSeeder } from './promo-code.seeder';
import { AppointmentSeeder } from './appointment.seeder';
import { ApplianceSeeder } from './appliance.seeder';
import { ServiceSeeder } from './service.seeder';
import { NotificationSeeder } from './notification.seeder';
import { CommitmentRewardSeeder } from './commitment-reward.seeder';
import { TechniciansSeeder } from './technicians.seeder';
import { PropertyBookingSeeder } from './property-booking.seeder';
import { PropertyTransferSeeder } from './property-transfer.seeder';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { Location, LocationSchema } from '../../modules/locations/schemas/location.schema';
import { Amenity, AmenitySchema } from '../../modules/amenities/schemas/amenity.schema';
import { Property, PropertySchema } from '../../modules/properties/schemas/property.schema';
import { Contract, ContractSchema } from '../../modules/contracts/schemas/contract.schema';
import { PromoCode, PromoCodeSchema } from '../../modules/promo-codes/schemas/promo-code.schema';
import { Appointment, AppointmentSchema } from '../../modules/appointments/schemas/appointment.schema';
import { Appliance, ApplianceSchema } from '../../modules/appliances/schemas/appliance.schema';
import { Service, ServiceSchema } from '../../modules/services/schemas/service.schema';
import { Notification, NotificationSchema } from '../../modules/notifications/schemas/notification.schema';
import { CommitmentReward, CommitmentRewardSchema } from '../../modules/rewards/schemas/commitment-reward.schema';
import { Technician, TechnicianSchema } from '../../modules/technicians/schemas/technician.schema';
import { PropertyBooking, PropertyBookingSchema } from '../../modules/bookings/schemas/property-booking.schema';
import { PropertyTransfer, PropertyTransferSchema } from '../../modules/bookings/schemas/property-transfer.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Amenity.name, schema: AmenitySchema },
      { name: Property.name, schema: PropertySchema },
      { name: Contract.name, schema: ContractSchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Appliance.name, schema: ApplianceSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: CommitmentReward.name, schema: CommitmentRewardSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: PropertyBooking.name, schema: PropertyBookingSchema },
      { name: PropertyTransfer.name, schema: PropertyTransferSchema },
    ]),
  ],
  providers: [UserSeeder, AdminUserSeeder, LocationSeeder, AmenitySeeder, PropertySeeder, ContractSeeder, PromoCodeSeeder, AppointmentSeeder, ApplianceSeeder, ServiceSeeder, NotificationSeeder, CommitmentRewardSeeder, TechniciansSeeder, PropertyBookingSeeder, PropertyTransferSeeder],
  exports: [UserSeeder, AdminUserSeeder, LocationSeeder, AmenitySeeder, PropertySeeder, ContractSeeder, PromoCodeSeeder, AppointmentSeeder, ApplianceSeeder, ServiceSeeder, NotificationSeeder, CommitmentRewardSeeder, TechniciansSeeder, PropertyBookingSeeder, PropertyTransferSeeder],
})
export class SeederModule {}
