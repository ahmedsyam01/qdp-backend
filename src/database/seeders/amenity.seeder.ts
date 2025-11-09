import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity, AmenityDocument } from '../../modules/amenities/schemas/amenity.schema';

@Injectable()
export class AmenitySeeder {
  constructor(
    @InjectModel(Amenity.name)
    private amenityModel: Model<AmenityDocument>,
  ) {}

  async seed() {
    const count = await this.amenityModel.countDocuments();
    if (count > 0) {
      console.log('Amenities already seeded');
      return;
    }

    const amenities = [
      // Security amenities
      {
        nameEn: '24/7 Security',
        nameAr: 'حراسة أمنية 24/7',
        icon: 'security',
        category: 'security',
      },
      {
        nameEn: 'CCTV Surveillance',
        nameAr: 'كاميرات مراقبة',
        icon: 'camera',
        category: 'security',
      },
      {
        nameEn: 'Gated Community',
        nameAr: 'مجمع مغلق',
        icon: 'gate',
        category: 'security',
      },
      {
        nameEn: 'Security Alarm System',
        nameAr: 'نظام إنذار',
        icon: 'alarm',
        category: 'security',
      },
      {
        nameEn: 'Access Control',
        nameAr: 'التحكم في الدخول',
        icon: 'access',
        category: 'security',
      },

      // Recreation amenities
      {
        nameEn: 'Swimming Pool',
        nameAr: 'مسبح',
        icon: 'pool',
        category: 'recreation',
      },
      {
        nameEn: 'Gym / Fitness Center',
        nameAr: 'صالة رياضية',
        icon: 'gym',
        category: 'recreation',
      },
      {
        nameEn: 'Kids Play Area',
        nameAr: 'منطقة ألعاب للأطفال',
        icon: 'playground',
        category: 'recreation',
      },
      {
        nameEn: 'BBQ Area',
        nameAr: 'منطقة شواء',
        icon: 'bbq',
        category: 'recreation',
      },
      {
        nameEn: 'Garden',
        nameAr: 'حديقة',
        icon: 'garden',
        category: 'recreation',
      },
      {
        nameEn: 'Sauna',
        nameAr: 'ساونا',
        icon: 'sauna',
        category: 'recreation',
      },
      {
        nameEn: 'Tennis Court',
        nameAr: 'ملعب تنس',
        icon: 'tennis',
        category: 'recreation',
      },
      {
        nameEn: 'Basketball Court',
        nameAr: 'ملعب كرة سلة',
        icon: 'basketball',
        category: 'recreation',
      },
      {
        nameEn: 'Jogging Track',
        nameAr: 'مسار جري',
        icon: 'track',
        category: 'recreation',
      },

      // Services amenities
      {
        nameEn: 'Concierge Service',
        nameAr: 'خدمة الكونسيرج',
        icon: 'concierge',
        category: 'services',
      },
      {
        nameEn: 'Maintenance Service',
        nameAr: 'خدمة الصيانة',
        icon: 'maintenance',
        category: 'services',
      },
      {
        nameEn: 'Housekeeping',
        nameAr: 'خدمة التنظيف',
        icon: 'cleaning',
        category: 'services',
      },
      {
        nameEn: 'Laundry Service',
        nameAr: 'خدمة الغسيل',
        icon: 'laundry',
        category: 'services',
      },
      {
        nameEn: 'Waste Disposal',
        nameAr: 'التخلص من النفايات',
        icon: 'waste',
        category: 'services',
      },
      {
        nameEn: 'Pet Friendly',
        nameAr: 'مسموح بالحيوانات الأليفة',
        icon: 'pet',
        category: 'services',
      },

      // Utilities amenities
      {
        nameEn: 'Central AC',
        nameAr: 'تكييف مركزي',
        icon: 'ac',
        category: 'utilities',
      },
      {
        nameEn: 'Split AC',
        nameAr: 'تكييف منفصل',
        icon: 'split-ac',
        category: 'utilities',
      },
      {
        nameEn: 'Internet / WiFi',
        nameAr: 'إنترنت / واي فاي',
        icon: 'wifi',
        category: 'utilities',
      },
      {
        nameEn: 'Satellite / Cable TV',
        nameAr: 'تلفزيون فضائي',
        icon: 'tv',
        category: 'utilities',
      },
      {
        nameEn: 'Intercom',
        nameAr: 'اتصال داخلي',
        icon: 'intercom',
        category: 'utilities',
      },
      {
        nameEn: 'Water Supply',
        nameAr: 'إمداد مياه',
        icon: 'water',
        category: 'utilities',
      },
      {
        nameEn: 'Electricity Backup',
        nameAr: 'كهرباء احتياطية',
        icon: 'generator',
        category: 'utilities',
      },

      // Facilities amenities
      {
        nameEn: 'Covered Parking',
        nameAr: 'مواقف مغطاة',
        icon: 'parking-covered',
        category: 'facilities',
      },
      {
        nameEn: 'Open Parking',
        nameAr: 'مواقف مفتوحة',
        icon: 'parking',
        category: 'facilities',
      },
      {
        nameEn: 'Elevator',
        nameAr: 'مصعد',
        icon: 'elevator',
        category: 'facilities',
      },
      {
        nameEn: 'Balcony',
        nameAr: 'شرفة',
        icon: 'balcony',
        category: 'facilities',
      },
      {
        nameEn: 'Terrace',
        nameAr: 'تراس',
        icon: 'terrace',
        category: 'facilities',
      },
      {
        nameEn: 'Storage Room',
        nameAr: 'غرفة تخزين',
        icon: 'storage',
        category: 'facilities',
      },
      {
        nameEn: 'Maid\'s Room',
        nameAr: 'غرفة خادمة',
        icon: 'maid-room',
        category: 'facilities',
      },
      {
        nameEn: 'Study Room',
        nameAr: 'غرفة دراسة',
        icon: 'study',
        category: 'facilities',
      },
      {
        nameEn: 'Private Entrance',
        nameAr: 'مدخل خاص',
        icon: 'door',
        category: 'facilities',
      },
      {
        nameEn: 'Built-in Wardrobes',
        nameAr: 'خزائن مدمجة',
        icon: 'wardrobe',
        category: 'facilities',
      },
      {
        nameEn: 'Built-in Kitchen Appliances',
        nameAr: 'أجهزة مطبخ مدمجة',
        icon: 'kitchen',
        category: 'facilities',
      },
      {
        nameEn: 'Sea View',
        nameAr: 'إطلالة بحرية',
        icon: 'sea-view',
        category: 'facilities',
      },
      {
        nameEn: 'City View',
        nameAr: 'إطلالة على المدينة',
        icon: 'city-view',
        category: 'facilities',
      },
    ];

    const created = await this.amenityModel.insertMany(amenities);
    console.log(`✅ ${created.length} amenities seeded successfully`);
  }
}
