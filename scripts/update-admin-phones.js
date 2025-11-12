require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/qdp';

console.log('🔗 Connecting to MongoDB...');
console.log('   URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log

async function updateAdminPhones() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Delete old admin users with invalid phone numbers
    const deleteResult = await usersCollection.deleteMany({
      phone: { $in: ['+97411111111', '+97422222222'] },
      userType: { $in: ['admin', 'super_admin'] }
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old admin users`);

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create new admin users with valid phone numbers
    const newAdmins = [
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
        createdAt: new Date(),
        updatedAt: new Date(),
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert new admin users
    const insertResult = await usersCollection.insertMany(newAdmins);
    console.log(`✅ Created ${insertResult.insertedCount} new admin users`);

    console.log('\n📋 Admin Login Credentials:');
    console.log('   - Super Admin: +97411111111 / Admin123!');
    console.log('   - Admin Manager: +97422222222 / Admin123!');
    console.log('\n✅ Admin users updated successfully!');

    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
updateAdminPhones();
