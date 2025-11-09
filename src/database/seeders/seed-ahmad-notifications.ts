import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'appointment_confirmed',
        'payment_due',
        'property_match',
        'service_completed',
        'contract_expiring',
        'message_received',
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntity: {
      entityType: { type: String },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    actionUrl: { type: String },
    readAt: { type: Date },
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  password: String,
  userType: String,
});

async function seed() {
  try {
    console.log('🌱 Seeding notifications for Ahmad...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/qdp';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', UserSchema);
    const Notification = mongoose.model('Notification', NotificationSchema);

    // Find Ahmad user
    const ahmad = await User.findOne({ phone: '+97412345678' });

    if (!ahmad) {
      console.log('❌ Ahmad user not found');
      process.exit(1);
    }

    console.log(`✅ Found Ahmad user: ${ahmad.fullName} (${ahmad._id})`);

    // Delete existing notifications for Ahmad
    await Notification.deleteMany({ userId: ahmad._id });
    console.log('🗑️  Deleted existing notifications for Ahmad\n');

    const now = new Date();

    // Create 3 unread notifications
    const unreadNotifications = [
      {
        userId: ahmad._id,
        type: 'appointment_confirmed',
        title: 'تم تأكيد موعدك بنجاح!',
        message:
          'موعدك يوم الخميس 3 مارس، 2025 الساعة 04:00 م في معاينة العقار - وحدة 2048 عرض تفاصيل الموعد',
        icon: 'checkmark_circle',
        isRead: false,
        readAt: null,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'payment_due',
        title: 'دفعة مستحقة',
        message: 'لديك دفعة إيجار مستحقة بقيمة 5048 ريال. ادفع الآن لتجنب الغرامات.',
        icon: 'credit_card',
        isRead: false,
        readAt: null,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'property_match',
        title: 'عقار يطابق بحثك',
        message: 'وجدنا عقاراً جديداً في قطر، الدوحة يطابق معايير بحثك. اضغط للمشاهدة.',
        icon: 'home',
        isRead: false,
        readAt: null,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    // Create 12 read notifications
    const readNotifications = [
      {
        userId: ahmad._id,
        type: 'service_completed',
        title: 'تم إنجاز طلب الصيانة',
        message: 'تم إنجاز طلب صيانة التكييف بنجاح. يرجى تقييم الخدمة.',
        icon: 'tool',
        isRead: true,
        readAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'contract_expiring',
        title: 'عقدك على وشك الانتهاء',
        message: 'منتهي، شهر على انتهاء عقد ايجار وحدة. يجدد العقد الان.',
        icon: 'calendar_warning',
        isRead: true,
        readAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'message_received',
        title: 'رسالة جديدة',
        message: 'لديك رسالة جديدة من وكيل العقارات. اضغط للمشاهدة.',
        icon: 'chat',
        isRead: true,
        readAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'appointment_confirmed',
        title: 'تم تأكيد موعدك',
        message: 'تم تأكيد موعد معاينة العقار بنجاح في 15 فبراير 2025. نتطلع لرؤيتك!',
        icon: 'checkmark_circle',
        isRead: true,
        readAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'payment_due',
        title: 'دفعة مستحقة',
        message: 'لديك دفعة مستحقة بقيمة 3500 ريال. ادفع الآن لتجنب الغرامات.',
        icon: 'credit_card',
        isRead: true,
        readAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'property_match',
        title: 'عقار يطابق بحثك',
        message: 'وجدنا عقاراً في منطقة الوكرة يطابق معايير بحثك. اضغط للمشاهدة.',
        icon: 'home',
        isRead: true,
        readAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'service_completed',
        title: 'تم إنجاز طلب الصيانة',
        message: 'تم إنجاز طلب صيانة السباكة بنجاح. يرجى تقييم الخدمة.',
        icon: 'tool',
        isRead: true,
        readAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'message_received',
        title: 'رسالة جديدة',
        message: 'لديك رسالة جديدة من مدير العقار. اضغط للمشاهدة.',
        icon: 'chat',
        isRead: true,
        readAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'appointment_confirmed',
        title: 'تم تأكيد موعدك',
        message: 'تم تأكيد موعد تسليم المفاتيح في 28 يناير 2025. نتطلع لرؤيتك!',
        icon: 'checkmark_circle',
        isRead: true,
        readAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'contract_expiring',
        title: 'تذكير بانتهاء العقد',
        message: 'يجب تجديد عقدك خلال شهرين. تواصل معنا للتجديد.',
        icon: 'calendar_warning',
        isRead: true,
        readAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'property_match',
        title: 'عقار يطابق بحثك',
        message: 'وجدنا شقة فاخرة في اللؤلؤة قطر تطابق معايير بحثك.',
        icon: 'home',
        isRead: true,
        readAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      },
      {
        userId: ahmad._id,
        type: 'service_completed',
        title: 'تم إنجاز طلب الصيانة',
        message: 'تم إنجاز طلب صيانة الكهرباء بنجاح. شكراً لك.',
        icon: 'tool',
        isRead: true,
        readAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 38 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      },
    ];

    const allNotifications = [...unreadNotifications, ...readNotifications];

    await Notification.insertMany(allNotifications);

    console.log(
      `\n✅ Successfully seeded ${allNotifications.length} notifications for Ahmad:`,
    );
    console.log(`   - ${unreadNotifications.length} unread notifications`);
    console.log(`   - ${readNotifications.length} read notifications`);

    // Verify by counting
    const totalCount = await Notification.countDocuments({ userId: ahmad._id });
    const unreadCountVerify = await Notification.countDocuments({
      userId: ahmad._id,
      isRead: false,
    });
    console.log(`\n📊 Verification:`);
    console.log(`   - Total notifications in DB: ${totalCount}`);
    console.log(`   - Unread notifications in DB: ${unreadCountVerify}`);

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
