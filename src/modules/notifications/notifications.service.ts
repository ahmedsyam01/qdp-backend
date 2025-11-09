import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createDto: any): Promise<Notification> {
    const notification = new this.notificationModel(createDto);
    await notification.save();

    // TODO: Send push notification here
    // await this.pushNotificationService.send(notification);

    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId), isRead: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async delete(id: string): Promise<Notification | null> {
    return this.notificationModel.findByIdAndDelete(id);
  }

  // Helper methods to create specific notification types
  async notifyAppointmentConfirmed(
    userId: string,
    appointmentId: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'appointment_confirmed',
      title: 'تم تأكيد موعدك',
      message:
        'تم تأكيد موعد معاينة العقار بنجاح. انقر للاطلاع على التفاصيل.',
      icon: 'checkmark_circle',
      relatedEntity: {
        type: 'appointment',
        id: new Types.ObjectId(appointmentId),
      },
      actionUrl: `/appointments/${appointmentId}`,
    });
  }

  async notifyPaymentDue(
    userId: string,
    contractId: string,
    amount: number,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'payment_due',
      title: 'دفعة مستحقة',
      message: `لديك دفعة مستحقة بقيمة ${amount} ريال. ادفع الآن لتجنب الغرامات.`,
      icon: 'credit_card',
      relatedEntity: { type: 'contract', id: new Types.ObjectId(contractId) },
      actionUrl: `/contracts/${contractId}/payment`,
    });
  }

  async notifyPropertyMatch(
    userId: string,
    propertyId: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'property_match',
      title: 'عقار يطابق بحثك',
      message: 'وجدنا عقاراً يطابق معايير بحثك. اضغط للمشاهدة.',
      icon: 'home',
      relatedEntity: { type: 'property', id: new Types.ObjectId(propertyId) },
      actionUrl: `/properties/${propertyId}`,
    });
  }

  async notifyServiceCompleted(
    userId: string,
    serviceId: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'service_completed',
      title: 'تم إنجاز طلب الصيانة',
      message: 'تم إنجاز طلب الصيانة بنجاح. يرجى تقييم الخدمة.',
      icon: 'tool',
      relatedEntity: { type: 'service', id: new Types.ObjectId(serviceId) },
      actionUrl: `/services/${serviceId}/rate`,
    });
  }

  async notifyContractExpiring(
    userId: string,
    contractId: string,
    daysLeft: number,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'contract_expiring',
      title: 'عقدك على وشك الانتهاء',
      message: `عقدك سينتهي خلال ${daysLeft} أيام. جدد الآن.`,
      icon: 'calendar_warning',
      relatedEntity: { type: 'contract', id: new Types.ObjectId(contractId) },
      actionUrl: `/contracts/${contractId}/renew`,
    });
  }

  async notifyMessageReceived(
    userId: string,
    senderId: string,
    messagePreview: string,
  ): Promise<Notification> {
    return this.create({
      userId: new Types.ObjectId(userId),
      type: 'message_received',
      title: 'رسالة جديدة',
      message: messagePreview,
      icon: 'chat',
      relatedEntity: { type: 'message', id: new Types.ObjectId(senderId) },
      actionUrl: `/messages/${senderId}`,
    });
  }
}
