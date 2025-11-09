import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../modules/notifications/schemas/notification.schema';
import { User } from '../../modules/users/schemas/user.schema';

@Injectable()
export class NotificationSeeder {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    const count = await this.notificationModel.countDocuments();
    if (count > 0) {
      console.log('Notifications already seeded');
      return;
    }

    // Get all users
    const users = await this.userModel.find().limit(10);

    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    const notificationTypes = [
      {
        type: 'appointment_confirmed',
        title: 'تم تأكيد موعدك',
        message:
          'تم تأكيد موعد معاينة العقار بنجاح في 3 مارس 2025 الساعة 04:00 م. نتطلع لرؤيتك!',
        icon: 'checkmark_circle',
      },
      {
        type: 'payment_due',
        title: 'دفعة مستحقة',
        message:
          'لديك دفعة إيجار مستحقة بقيمة 5048 ريال. ادفع الآن لتجنب الغرامات.',
        icon: 'credit_card',
      },
      {
        type: 'property_match',
        title: 'عقار يطابق بحثك',
        message:
          'وجدنا عقاراً جديداً في قطر، الدوحة يطابق معايير بحثك. اضغط للمشاهدة.',
        icon: 'home',
      },
      {
        type: 'service_completed',
        title: 'تم إنجاز طلب الصيانة',
        message: 'تم إنجاز طلب صيانة التكييف بنجاح. يرجى تقييم الخدمة.',
        icon: 'tool',
      },
      {
        type: 'contract_expiring',
        title: 'عقدك على وشك الانتهاء',
        message: 'منتهي، شهر على انتهاء عقد ايجار وحدة. يجدد العقد الان.',
        icon: 'calendar_warning',
      },
      {
        type: 'message_received',
        title: 'رسالة جديدة',
        message: 'لديك رسالة جديدة من وكيل العقارات. اضغط للمشاهدة.',
        icon: 'chat',
      },
    ];

    const notifications = [];

    for (const user of users) {
      // Create 15 notifications per user (3 unread + 12 read)
      for (let i = 0; i < 15; i++) {
        const notifType =
          notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const hoursAgo = Math.floor(Math.random() * 720); // 0-30 days ago
        const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        const isRead = i >= 3; // First 3 are unread

        notifications.push({
          userId: user._id,
          type: notifType.type,
          title: notifType.title,
          message: notifType.message,
          icon: notifType.icon,
          isRead,
          readAt: isRead
            ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000)
            : null,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }

    await this.notificationModel.insertMany(notifications);
    console.log(
      `✅ Notifications seeded successfully (${notifications.length} notifications for ${users.length} users)`,
    );
  }
}
