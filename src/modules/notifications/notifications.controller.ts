import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.notificationsService.findByUser(user.userId);
  }

  @Get('unread')
  async findUnread(@CurrentUser() user: any) {
    return this.notificationsService.findUnread(user.userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('mark-all-read')
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationsService.markAllAsRead(user.userId);
    return {
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.notificationsService.delete(id);
    return { message: 'Notification deleted successfully' };
  }

  @Post('seed-test')
  async seedTestNotifications(@CurrentUser() user: any) {
    const userId = new Types.ObjectId(user.userId);
    const now = new Date();

    // Create 3 unread notifications
    await this.notificationsService.create({
      userId,
      type: 'appointment_confirmed',
      title: 'تم تأكيد موعدك بنجاح!',
      message:
        'موعدك يوم الخميس 3 مارس، 2025 الساعة 04:00 م في معاينة العقار - وحدة 2048 عرض تفاصيل الموعد',
      icon: 'checkmark_circle',
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    await this.notificationsService.create({
      userId,
      type: 'payment_due',
      title: 'دفعة مستحقة',
      message: 'لديك دفعة إيجار مستحقة بقيمة 5048 ريال. ادفع الآن لتجنب الغرامات.',
      icon: 'credit_card',
      isRead: false,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    });

    await this.notificationsService.create({
      userId,
      type: 'property_match',
      title: 'عقار يطابق بحثك',
      message: 'وجدنا عقاراً جديداً في قطر، الدوحة يطابق معايير بحثك. اضغط للمشاهدة.',
      icon: 'home',
      isRead: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });

    // Create some read notifications
    for (let i = 0; i < 12; i++) {
      const types = [
        'service_completed',
        'contract_expiring',
        'message_received',
        'appointment_confirmed',
        'payment_due',
        'property_match',
      ];
      const type = types[i % types.length];

      await this.notificationsService.create({
        userId,
        type,
        title: this.getNotificationTitle(type),
        message: this.getNotificationMessage(type),
        icon: this.getNotificationIcon(type),
        isRead: true,
        readAt: new Date(now.getTime() - (i + 2) * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - (i + 3) * 24 * 60 * 60 * 1000),
      });
    }

    return { message: '15 test notifications created successfully' };
  }

  private getNotificationTitle(type: string): string {
    const titles: Record<string, string> = {
      appointment_confirmed: 'تم تأكيد موعدك',
      payment_due: 'دفعة مستحقة',
      property_match: 'عقار يطابق بحثك',
      service_completed: 'تم إنجاز طلب الصيانة',
      contract_expiring: 'عقدك على وشك الانتهاء',
      message_received: 'رسالة جديدة',
    };
    return titles[type] || 'إشعار جديد';
  }

  private getNotificationMessage(type: string): string {
    const messages: Record<string, string> = {
      appointment_confirmed: 'تم تأكيد موعد معاينة العقار بنجاح. نتطلع لرؤيتك!',
      payment_due: 'لديك دفعة مستحقة. ادفع الآن لتجنب الغرامات.',
      property_match: 'وجدنا عقاراً يطابق معايير بحثك.',
      service_completed: 'تم إنجاز طلب الصيانة بنجاح. يرجى تقييم الخدمة.',
      contract_expiring: 'عقدك سينتهي قريباً. جدد الآن.',
      message_received: 'لديك رسالة جديدة.',
    };
    return messages[type] || 'لديك إشعار جديد';
  }

  private getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      appointment_confirmed: 'checkmark_circle',
      payment_due: 'credit_card',
      property_match: 'home',
      service_completed: 'tool',
      contract_expiring: 'calendar_warning',
      message_received: 'chat',
    };
    return icons[type] || 'bell';
  }
}
