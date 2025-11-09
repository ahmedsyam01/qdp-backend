import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../../modules/appointments/schemas/appointment.schema';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';
import { Property, PropertyDocument } from '../../modules/properties/schemas/property.schema';

@Injectable()
export class AppointmentSeeder {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
  ) {}

  async seed() {
    const count = await this.appointmentModel.countDocuments();
    if (count > 0) {
      console.log('Appointments already seeded');
      return;
    }

    // Get existing users and properties
    const users = await this.userModel.find().lean();
    const properties = await this.propertyModel.find().limit(20).lean();

    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    if (properties.length === 0) {
      console.log('⚠️  No properties found. Please seed properties first.');
      return;
    }

    // Find agents (if any users have 'agent' role)
    const agents = users.filter((u: any) => u.userType === 'agent');

    const appointmentTypes = ['viewing', 'delivery'];
    const statuses = ['confirmed', 'received', 'in_progress', 'agent', 'unconfirmed'];

    // Arabic time slots
    const times = [
      '9:00 ص',
      '10:00 ص',
      '11:00 ص',
      '12:00 م',
      '2:00 م',
      '3:00 م',
      '4:00 م',
      '5:00 م',
      '6:00 م',
    ];

    const appointments: any[] = [];

    // Create 40 realistic appointments
    for (let i = 0; i < 40; i++) {
      // Random date between -30 days and +30 days from today
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);
      appointmentDate.setHours(0, 0, 0, 0); // Reset time to midnight

      const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const property = properties[Math.floor(Math.random() * properties.length)];

      const appointment: any = {
        userId: user._id,
        propertyId: property._id,
        appointmentType,
        date: appointmentDate,
        time: times[Math.floor(Math.random() * times.length)],
        status,
        notes: appointmentType === 'viewing'
          ? `طلب معاينة للعقار - ${i + 1}`
          : `موعد تسليم الوحدة - ${i + 1}`,
        reminderSent: Math.random() > 0.5,
      };

      // Assign agent if status is 'agent' or 'confirmed' or 'in_progress'
      if (['agent', 'confirmed', 'in_progress'].includes(status) && agents.length > 0) {
        appointment.agentId = agents[Math.floor(Math.random() * agents.length)]._id;
      }

      // Add location from property
      if (property.location) {
        appointment.location = {
          address: property.location.address,
          coordinates: {
            latitude: property.location.coordinates?.coordinates?.[1] || 25.286106,
            longitude: property.location.coordinates?.coordinates?.[0] || 51.534817,
          },
        };
      }

      // If status is 'received', set completedAt
      if (status === 'received') {
        const completedDate = new Date(appointmentDate);
        completedDate.setHours(Math.floor(Math.random() * 8) + 10); // Random time between 10 AM - 6 PM
        appointment.completedAt = completedDate;
      }

      // If status is 'unconfirmed' and date is in the past, set cancellation
      if (status === 'unconfirmed' && daysOffset < -5) {
        const cancelledDate = new Date(appointmentDate);
        cancelledDate.setDate(cancelledDate.getDate() - Math.floor(Math.random() * 5) - 1);
        appointment.cancelledAt = cancelledDate;
        appointment.cancellationReason = 'تم إلغاء الموعد من قبل العميل';
      }

      appointments.push(appointment);
    }

    const created = await this.appointmentModel.insertMany(appointments);
    console.log(`✅ ${created.length} appointments seeded successfully`);
    console.log(`   - ${appointments.filter(a => a.appointmentType === 'viewing').length} viewing appointments`);
    console.log(`   - ${appointments.filter(a => a.appointmentType === 'delivery').length} delivery appointments`);
    console.log(`   - Status breakdown:`);
    statuses.forEach(s => {
      const count = appointments.filter(a => a.status === s).length;
      console.log(`     * ${s}: ${count}`);
    });
  }
}
