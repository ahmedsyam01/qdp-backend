import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

@Injectable()
export class UserSeeder {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async seed() {
    const count = await this.userModel.countDocuments();
    if (count > 0) {
      console.log('✅ Users already seeded');
      return;
    }

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const users = [
      {
        fullName: 'Ahmad Al-Kuwari',
        identityNumber: '28012345678',
        phone: '+97412345678',
        email: 'ahmad@example.com',
        password: hashedPassword,
        userType: 'buyer',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: true,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: false,
        },
      },
      {
        fullName: 'Fatima Al-Thani',
        identityNumber: '28098765432',
        phone: '+97498765432',
        email: 'fatima@example.com',
        password: hashedPassword,
        userType: 'seller',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: false,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: true,
        },
      },
      {
        fullName: 'Mohammed Hassan',
        identityNumber: '28055555555',
        phone: '+97455555555',
        email: 'mohammed@example.com',
        password: hashedPassword,
        userType: 'agent',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: true,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: true,
        },
      },
      {
        fullName: 'Aisha Abdullah',
        identityNumber: '28066666666',
        phone: '+97466666666',
        email: 'aisha@example.com',
        password: hashedPassword,
        userType: 'buyer',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        notificationPreferences: {
          push: true,
          email: false,
          sms: true,
          propertyMatches: true,
          bookings: true,
          appointments: true,
          operations: false,
          messages: true,
          promotions: false,
        },
      },
      {
        fullName: 'John Smith',
        identityNumber: '28077777777',
        phone: '+97477777777',
        email: 'john@example.com',
        password: hashedPassword,
        userType: 'buyer',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'en',
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: true,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: true,
        },
      },
    ];

    await this.userModel.insertMany(users);
    console.log('✅ Users seeded successfully (5 users)');
  }
}
