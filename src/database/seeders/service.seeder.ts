import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../../modules/services/schemas/service.schema';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';
import { Property, PropertyDocument } from '../../modules/properties/schemas/property.schema';

@Injectable()
export class ServiceSeeder {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async seed() {
    const count = await this.serviceModel.countDocuments();
    if (count > 0) {
      console.log('✅ Services already seeded');
      return;
    }

    // Get users and properties for relationships
    const users = await this.userModel.find();
    const properties = await this.propertyModel.find().limit(20);

    if (users.length === 0 || properties.length === 0) {
      console.log('⚠️  Cannot seed services: Users or properties not found. Please seed users and properties first.');
      return;
    }

    // Service types with Arabic titles
    const serviceTypes = [
      {
        type: 'furniture',
        titleAr: 'صيانة الأثاث',
        titleEn: 'Furniture Maintenance',
        descriptions: [
          'إصلاح كرسي مكسور في غرفة المعيشة',
          'تركيب خزانة ملابس جديدة',
          'إصلاح طاولة الطعام',
          'صيانة الأريكة وتغيير القماش',
          'تركيب رفوف حائط',
        ],
      },
      {
        type: 'plumbing',
        titleAr: 'صيانة السباكة',
        titleEn: 'Plumbing Services',
        descriptions: [
          'تسريب في صنبور المطبخ',
          'انسداد في حوض الحمام',
          'إصلاح تسريب المياه في الحمام',
          'تركيب سخان مياه جديد',
          'صيانة المرحاض',
        ],
      },
      {
        type: 'electrical',
        titleAr: 'صيانة الكهرباء',
        titleEn: 'Electrical Services',
        descriptions: [
          'تركيب مصابيح LED في غرفة النوم',
          'إصلاح مقبس كهربائي لا يعمل',
          'فحص الدائرة الكهربائية',
          'تركيب مروحة سقف',
          'إصلاح لوحة الكهرباء الرئيسية',
        ],
      },
      {
        type: 'ac',
        titleAr: 'صيانة التكييف',
        titleEn: 'AC Maintenance',
        descriptions: [
          'تنظيف فلاتر المكيف',
          'إعادة تعبئة غاز الفريون',
          'صيانة دورية للمكيف',
          'إصلاح تسريب مياه من المكيف',
          'تركيب مكيف جديد',
        ],
      },
    ];

    const statuses = [
      { status: 'pending', weight: 2 },
      { status: 'in_progress', weight: 3 },
      { status: 'completed', weight: 4 },
      { status: 'cancelled', weight: 1 },
    ];

    const services = [];

    // Create 50 service requests
    for (let i = 0; i < 50; i++) {
      const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      const description = serviceType.descriptions[Math.floor(Math.random() * serviceType.descriptions.length)];

      // Weighted random status selection
      const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedStatus = 'pending';

      for (const statusObj of statuses) {
        random -= statusObj.weight;
        if (random <= 0) {
          selectedStatus = statusObj.status;
          break;
        }
      }

      // Random date in the past 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - daysAgo);

      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProperty = properties[Math.floor(Math.random() * properties.length)];

      const service: any = {
        userId: randomUser._id,
        propertyId: randomProperty._id,
        serviceType: serviceType.type,
        title: `${serviceType.titleAr} - طلب ${i + 1}`,
        description: description,
        requestDate,
        status: selectedStatus,
        estimatedCost: Math.floor(Math.random() * 400) + 100, // 100-500 QAR
      };

      // If not pending, assign a technician
      if (selectedStatus !== 'pending') {
        const technicianNames = [
          'أحمد محمد',
          'خالد عبدالله',
          'عمر حسن',
          'سعيد علي',
          'يوسف إبراهيم',
        ];

        service.technicianName = technicianNames[Math.floor(Math.random() * technicianNames.length)];
        service.technicianId = users[Math.floor(Math.random() * users.length)]._id;

        // Scheduled date 2-3 days after request
        const scheduledDate = new Date(requestDate);
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 2) + 2);
        service.scheduledDate = scheduledDate;
      }

      // If completed, add completion details
      if (selectedStatus === 'completed') {
        const completionDate = new Date(service.scheduledDate);
        completionDate.setDate(completionDate.getDate() + Math.floor(Math.random() * 3) + 1);
        service.completionDate = completionDate;
        service.cost = service.estimatedCost + Math.floor(Math.random() * 100) - 50; // Slight variation
        service.rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        service.feedback = [
          'خدمة ممتازة، شكراً جزيلاً',
          'عمل احترافي وسريع',
          'راضي جداً عن الخدمة',
          'فني محترف ومتعاون',
          'تم إنجاز العمل بشكل مثالي',
        ][Math.floor(Math.random() * 5)];
        service.isPaid = Math.random() > 0.2; // 80% paid
      }

      // If in progress, some might be paid upfront
      if (selectedStatus === 'in_progress') {
        service.isPaid = Math.random() > 0.7; // 30% paid upfront
        if (service.isPaid) {
          service.cost = service.estimatedCost;
        }
      }

      // If cancelled, might have cancellation note
      if (selectedStatus === 'cancelled') {
        const completionDate = new Date(requestDate);
        completionDate.setDate(completionDate.getDate() + Math.floor(Math.random() * 5) + 1);
        service.completionDate = completionDate;
        service.feedback = [
          'تم الإلغاء بناءً على طلب العميل',
          'الفني غير متوفر',
          'تم حل المشكلة بطريقة أخرى',
        ][Math.floor(Math.random() * 3)];
      }

      services.push(service);
    }

    await this.serviceModel.insertMany(services);
    console.log('✅ Services seeded successfully (50 service requests)');
    console.log(`   - Furniture: ${services.filter(s => s.serviceType === 'furniture').length}`);
    console.log(`   - Plumbing: ${services.filter(s => s.serviceType === 'plumbing').length}`);
    console.log(`   - Electrical: ${services.filter(s => s.serviceType === 'electrical').length}`);
    console.log(`   - AC: ${services.filter(s => s.serviceType === 'ac').length}`);
    console.log(`   - Pending: ${services.filter(s => s.status === 'pending').length}`);
    console.log(`   - In Progress: ${services.filter(s => s.status === 'in_progress').length}`);
    console.log(`   - Completed: ${services.filter(s => s.status === 'completed').length}`);
    console.log(`   - Cancelled: ${services.filter(s => s.status === 'cancelled').length}`);
  }
}
