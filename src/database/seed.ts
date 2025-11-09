import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { UserSeeder } from './seeders/user.seeder';
import { AdminUserSeeder } from './seeders/admin-user.seeder';
import { LocationSeeder } from './seeders/location.seeder';
import { AmenitySeeder } from './seeders/amenity.seeder';
import { PropertySeeder } from './seeders/property.seeder';
import { ContractSeeder } from './seeders/contract.seeder';
import { PromoCodeSeeder } from './seeders/promo-code.seeder';
import { AppointmentSeeder } from './seeders/appointment.seeder';
import { ApplianceSeeder } from './seeders/appliance.seeder';
import { ServiceSeeder } from './seeders/service.seeder';
import { NotificationSeeder } from './seeders/notification.seeder';
import { CommitmentRewardSeeder } from './seeders/commitment-reward.seeder';
import { TechniciansSeeder } from './seeders/technicians.seeder';
import { PropertyBookingSeeder } from './seeders/property-booking.seeder';
import { PropertyTransferSeeder } from './seeders/property-transfer.seeder';

async function bootstrap() {
  console.log('🌱 Starting database seeding...\n');

  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    // Seed in order: Users -> Admin Users -> Locations -> Amenities -> Properties -> Contracts -> Promo Codes -> Appointments -> Appliances -> Technicians -> Services -> Notifications -> Commitment Rewards
    console.log('1️⃣  Seeding Users...');
    const userSeeder = app.get(UserSeeder);
    await userSeeder.seed();

    console.log('\n2️⃣  Seeding Admin Users...');
    const adminUserSeeder = app.get(AdminUserSeeder);
    await adminUserSeeder.seed();

    console.log('\n3️⃣  Seeding Locations...');
    const locationSeeder = app.get(LocationSeeder);
    await locationSeeder.seed();

    console.log('\n4️⃣  Seeding Amenities...');
    const amenitySeeder = app.get(AmenitySeeder);
    await amenitySeeder.seed();

    console.log('\n5️⃣  Seeding Properties...');
    const propertySeeder = app.get(PropertySeeder);
    await propertySeeder.seed();

    console.log('\n6️⃣  Seeding Contracts...');
    const contractSeeder = app.get(ContractSeeder);
    await contractSeeder.seed();

    console.log('\n7️⃣  Seeding Promo Codes...');
    const promoCodeSeeder = app.get(PromoCodeSeeder);
    await promoCodeSeeder.seed();

    console.log('\n8️⃣  Seeding Appointments...');
    const appointmentSeeder = app.get(AppointmentSeeder);
    await appointmentSeeder.seed();

    console.log('\n9️⃣  Seeding Appliances...');
    const applianceSeeder = app.get(ApplianceSeeder);
    await applianceSeeder.seed();

    console.log('\n🔟 Seeding Technicians...');
    const techniciansSeeder = app.get(TechniciansSeeder);
    await techniciansSeeder.seed();

    console.log('\n1️⃣1️⃣  Seeding Services...');
    const serviceSeeder = app.get(ServiceSeeder);
    await serviceSeeder.seed();

    console.log('\n1️⃣2️⃣  Seeding Notifications...');
    const notificationSeeder = app.get(NotificationSeeder);
    await notificationSeeder.seed();

    console.log('\n1️⃣3️⃣  Seeding Commitment Rewards...');
    const commitmentRewardSeeder = app.get(CommitmentRewardSeeder);
    await commitmentRewardSeeder.seed();

    console.log('\n1️⃣4️⃣  Seeding Property Bookings (with installments)...');
    const propertyBookingSeeder = app.get(PropertyBookingSeeder);
    await propertyBookingSeeder.seed();

    console.log('\n1️⃣5️⃣  Seeding Property Transfer Requests...');
    const propertyTransferSeeder = app.get(PropertyTransferSeeder);
    await propertyTransferSeeder.seed();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Users: 5 accounts created');
    console.log('   - Admin Users: 2 admin accounts created');
    console.log('   - Locations: Qatar cities and areas added');
    console.log('   - Amenities: 40+ property features added');
    console.log('   - Properties: 50 sample listings created');
    console.log('   - Contracts: 35 contracts (rental & sale) created');
    console.log('   - Promo Codes: 5 active promo codes added');
    console.log('   - Appointments: 40 appointments (viewing & delivery) created');
    console.log('   - Appliances: 10 rental appliances added');
    console.log('   - Technicians: 8 technicians (AC, plumbing, electrical, furniture specialists) created');
    console.log('   - Services: 50 service requests (furniture, plumbing, electrical, AC) created');
    console.log('   - Notifications: 15 notifications per user (3 unread, 12 read)');
    console.log('   - Commitment Rewards: Rewards for all rental contracts created');
    console.log('   - Property Bookings: ~11 bookings (8 rent with installments, 3 sale)');
    console.log('   - Transfer Requests: ~5 transfer requests (pending, approved, rejected)');
    console.log('\n💡 You can now test the API endpoints with realistic data!');
    console.log('\n🎟️  Available Promo Codes:');
    console.log('   - WELCOME10 (10% off)');
    console.log('   - LISTING20 (20% off on listings)');
    console.log('   - SAVE50 (50 QAR fixed discount)');
    console.log('   - PROPERTY30 (30% off on premium listings)');
    console.log('   - NEWYEAR2025 (25% off)');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
