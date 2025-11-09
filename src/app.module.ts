import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AmenitiesModule } from './modules/amenities/amenities.module';
import { SeederModule } from './database/seeders/seeder.module';
import { UploadModule } from './modules/upload/upload.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { ListingsModule } from './modules/listings/listings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AppliancesModule } from './modules/appliances/appliances.module';
import { ServicesModule } from './modules/services/services.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AdminModule } from './modules/admin/admin.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    PropertiesModule,
    LocationsModule,
    AmenitiesModule,
    ContractsModule,
    ListingsModule,
    PaymentsModule,
    PromoCodesModule,
    AppointmentsModule,
    AppliancesModule,
    ServicesModule,
    TechniciansModule,
    NotificationsModule,
    RewardsModule,
    AdminModule,
    BookingsModule,
    SeederModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

