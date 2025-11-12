import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

@Injectable()
export class AdminUserSeeder {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async seed() {
    // Check if admin users already exist
    const adminCount = await this.userModel.countDocuments({
      userType: { $in: ['admin', 'super_admin'] },
    });

    if (adminCount > 0) {
      console.log('✅ Admin users already seeded');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const adminUsers = [
      {
        fullName: 'Super Admin',
        identityNumber: '28011111111',
        phone: '+97411111111',
        email: 'admin@qdp.qa',
        password: hashedPassword,
        userType: 'super_admin',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        adminPermissions: {
          users: { view: true, create: true, edit: true, delete: true },
          properties: { view: true, approve: true, edit: true, delete: true },
          appointments: { view: true, manage: true },
          payments: { view: true, refund: true },
          analytics: { view: true, export: true },
          settings: { view: true, edit: true },
        },
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: false,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: false,
        },
      },
      {
        fullName: 'Admin Manager',
        identityNumber: '28022222222',
        phone: '+97422222222',
        email: 'manager@qdp.qa',
        password: hashedPassword,
        userType: 'admin',
        phoneVerified: true,
        emailVerified: true,
        languagePreference: 'ar',
        adminPermissions: {
          users: { view: true, create: false, edit: true, delete: false },
          properties: { view: true, approve: true, edit: true, delete: false },
          appointments: { view: true, manage: true },
          payments: { view: true, refund: false },
          analytics: { view: true, export: true },
          settings: { view: true, edit: false },
        },
        notificationPreferences: {
          push: true,
          email: true,
          sms: true,
          propertyMatches: false,
          bookings: true,
          appointments: true,
          operations: true,
          messages: true,
          promotions: false,
        },
      },
    ];

    await this.userModel.insertMany(adminUsers);
    console.log('✅ Admin users seeded successfully (2 admin users)');
    console.log('   - Super Admin: +97411111111 / Admin123!');
    console.log('   - Admin Manager: +97422222222 / Admin123!');
  }
}
