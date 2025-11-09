import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminTechniciansController } from './admin-technicians.controller';
import { AdminTechniciansService } from './admin-technicians.service';
import { AdminAppliancesController } from './admin-appliances.controller';
import { AdminAppliancesService } from './admin-appliances.service';
import { AdminPropertiesController } from './admin-properties.controller';
import { AdminPropertiesService } from './admin-properties.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminContractsController } from './admin-contracts.controller';
import { AdminContractsService } from './admin-contracts.service';
import { AdminServicesController } from './admin-services.controller';
import { AdminServicesService } from './admin-services.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TechniciansModule } from '../technicians/technicians.module';
import { BookingsModule } from '../bookings/bookings.module';
import { Property, PropertySchema } from '../properties/schemas/property.schema';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Technician, TechnicianSchema } from '../technicians/schemas/technician.schema';
import { Appliance, ApplianceSchema } from '../appliances/schemas/appliance.schema';
import { ApplianceBooking, ApplianceBookingSchema } from '../appliances/schemas/appliance-booking.schema';
import { PropertyBooking, PropertyBookingSchema } from '../bookings/schemas/property-booking.schema';
import { PropertyTransfer, PropertyTransferSchema } from '../bookings/schemas/property-transfer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: Appliance.name, schema: ApplianceSchema },
      { name: ApplianceBooking.name, schema: ApplianceBookingSchema },
      { name: PropertyBooking.name, schema: PropertyBookingSchema },
      { name: PropertyTransfer.name, schema: PropertyTransferSchema },
    ]),
    TechniciansModule,
    BookingsModule,
  ],
  controllers: [
    AdminAnalyticsController,
    AdminUsersController,
    AdminTechniciansController,
    AdminAppliancesController,
    AdminPropertiesController,
    AdminAppointmentsController,
    AdminContractsController,
    AdminServicesController,
  ],
  providers: [
    AdminAnalyticsService,
    AdminUsersService,
    AdminTechniciansService,
    AdminAppliancesService,
    AdminPropertiesService,
    AdminAppointmentsService,
    AdminContractsService,
    AdminServicesService,
  ],
  exports: [
    AdminAnalyticsService,
    AdminUsersService,
    AdminTechniciansService,
    AdminAppliancesService,
    AdminPropertiesService,
    AdminAppointmentsService,
    AdminContractsService,
    AdminServicesService,
  ],
})
export class AdminModule {}
