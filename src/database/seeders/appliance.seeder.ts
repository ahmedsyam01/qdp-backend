import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Appliance,
  ApplianceDocument,
} from '../../modules/appliances/schemas/appliance.schema';

@Injectable()
export class ApplianceSeeder {
  constructor(
    @InjectModel(Appliance.name)
    private applianceModel: Model<ApplianceDocument>,
  ) {}

  async seed() {
    // Delete existing appliances to re-seed with updated data
    const count = await this.applianceModel.countDocuments();
    if (count > 0) {
      console.log('🔄 Deleting existing appliances to re-seed with updated data...');
      await this.applianceModel.deleteMany({});
    }

    const appliances = [
      {
        nameEn: 'Samsung Refrigerator',
        nameAr: 'ثلاجة سامسونج',
        applianceType: 'refrigerator',
        brand: 'Samsung',
        model: 'RT50K6000S8',
        color: 'Silver',
        descriptionEn:
          'Modern 500L refrigerator with digital inverter technology, twin cooling system, and energy-efficient operation. Perfect for families.',
        descriptionAr:
          'ثلاجة عصرية سعة 500 لتر مع تقنية العاكس الرقمي ونظام تبريد مزدوج وتشغيل موفر للطاقة. مثالية للعائلات.',
        images: [
          'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',
        ],
        rentalPrices: {
          oneMonth: 80,
          sixMonths: 140,
          oneYear: 200,
        },
        monthlyPrice: 80,
        deposit: 500,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '500 لتر',
          'اللون': 'فضي',
          'التقنية': 'Digital Inverter',
        },
      },
      {
        nameEn: '55" LG OLED Smart TV',
        nameAr: 'تلفزيون ذكي إل جي OLED 55 بوصة',
        applianceType: 'tv',
        brand: 'LG',
        model: 'OLED55C1',
        color: 'Black',
        descriptionEn:
          '55 inch 4K OLED Smart TV with WebOS, Dolby Vision, and AI ThinQ. Stunning picture quality with perfect blacks.',
        descriptionAr:
          'تلفزيون ذكي 55 بوصة 4K OLED مع WebOS و Dolby Vision و AI ThinQ. جودة صورة مذهلة مع سواد مثالي.',
        images: [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
        ],
        rentalPrices: {
          oneMonth: 150,
          sixMonths: 250,
          oneYear: 400,
        },
        monthlyPrice: 150,
        deposit: 800,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'الحجم': '55 بوصة',
          'الدقة': '4K OLED',
          'اللون': 'أسود',
        },
      },
      {
        nameEn: 'Bosch Front Load Washing Machine',
        nameAr: 'غسالة بوش تحميل أمامي',
        applianceType: 'washing_machine',
        brand: 'Bosch',
        model: 'WAW28790GC',
        color: 'White',
        descriptionEn:
          '9kg front load washing machine with EcoSilence motor, VarioPerfect, and ActiveWater Plus technology.',
        descriptionAr:
          'غسالة تحميل أمامي 9 كجم مع محرك EcoSilence وتقنية VarioPerfect و ActiveWater Plus.',
        images: [
          'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400',
        ],
        rentalPrices: {
          oneMonth: 100,
          sixMonths: 180,
          oneYear: 300,
        },
        monthlyPrice: 100,
        deposit: 600,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '9 كجم',
          'النوع': 'تحميل أمامي',
          'اللون': 'أبيض',
        },
      },
      {
        nameEn: 'Daikin Split Air Conditioner',
        nameAr: 'مكيف داكن سبليت',
        applianceType: 'ac',
        brand: 'Daikin',
        model: 'FTKM50TV',
        color: 'White',
        descriptionEn:
          '2 Ton split AC with inverter technology, powerful cooling, and energy-saving operation. Ideal for Qatar climate.',
        descriptionAr:
          'مكيف سبليت 2 طن مع تقنية الانفرتر وتبريد قوي وتشغيل موفر للطاقة. مثالي لمناخ قطر.',
        images: [
          'https://images.unsplash.com/photo-1635343296361-e3a22f1c8f1e?w=400',
        ],
        rentalPrices: {
          oneMonth: 120,
          sixMonths: 200,
          oneYear: 350,
        },
        monthlyPrice: 120,
        deposit: 700,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '2 طن',
          'النوع': 'سبليت',
          'اللون': 'أبيض',
        },
      },
      {
        nameEn: 'Samsung Built-in Oven',
        nameAr: 'فرن سامسونج مدمج',
        applianceType: 'oven',
        brand: 'Samsung',
        model: 'NV75K5571RS',
        color: 'Black',
        descriptionEn:
          'Dual Cook Flex oven with pyrolytic self-cleaning, 75L capacity, and smart WiFi connectivity.',
        descriptionAr:
          'فرن Dual Cook Flex مع التنظيف الذاتي الحراري وسعة 75 لتر واتصال WiFi الذكي.',
        images: [
          'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400',
        ],
        rentalPrices: {
          oneMonth: 90,
          sixMonths: 160,
          oneYear: 280,
        },
        monthlyPrice: 90,
        deposit: 550,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '75 لتر',
          'النوع': 'مدمج',
          'اللون': 'أسود',
        },
      },
      {
        nameEn: 'LG Microwave Oven',
        nameAr: 'ميكروويف إل جي',
        applianceType: 'microwave',
        brand: 'LG',
        model: 'MS2535GIS',
        color: 'Silver',
        descriptionEn:
          'NeoChef microwave with smart inverter, 25L capacity, and 1000W power. Even heating and fast cooking.',
        descriptionAr:
          'ميكروويف NeoChef مع انفرتر ذكي وسعة 25 لتر وقوة 1000 واط. تسخين متساوٍ وطهي سريع.',
        images: [
          'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',
        ],
        rentalPrices: {
          oneMonth: 60,
          sixMonths: 110,
          oneYear: 180,
        },
        monthlyPrice: 60,
        deposit: 400,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '25 لتر',
          'القوة': '1000 واط',
          'اللون': 'فضي',
        },
      },
      {
        nameEn: 'Bosch Dishwasher',
        nameAr: 'غسالة صحون بوش',
        applianceType: 'dishwasher',
        brand: 'Bosch',
        model: 'SMS46GW01Q',
        color: 'White',
        descriptionEn:
          '13 place settings dishwasher with 6 programs, AquaStop protection, and ultra-quiet operation at 48dB.',
        descriptionAr:
          'غسالة صحون لـ 13 طقم مع 6 برامج وحماية AquaStop وتشغيل هادئ للغاية عند 48 ديسيبل.',
        images: [
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
        ],
        rentalPrices: {
          oneMonth: 110,
          sixMonths: 190,
          oneYear: 320,
        },
        monthlyPrice: 110,
        deposit: 650,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '13 طقم',
          'البرامج': '6 برامج',
          'اللون': 'أبيض',
        },
      },
      {
        nameEn: 'Haier Compact Refrigerator',
        nameAr: 'ثلاجة هاير صغيرة',
        applianceType: 'refrigerator',
        brand: 'Haier',
        model: 'HR-62HP',
        color: 'White',
        descriptionEn:
          'Compact 62L refrigerator perfect for small apartments, studios, or offices. Energy-efficient and quiet.',
        descriptionAr:
          'ثلاجة صغيرة سعة 62 لتر مثالية للشقق الصغيرة أو الاستوديوهات أو المكاتب. موفرة للطاقة وهادئة.',
        images: [
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
        ],
        rentalPrices: {
          oneMonth: 50,
          sixMonths: 90,
          oneYear: 150,
        },
        monthlyPrice: 50,
        deposit: 350,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '62 لتر',
          'النوع': 'صغيرة',
          'اللون': 'أبيض',
        },
      },
      {
        nameEn: 'Sony 43" Smart TV',
        nameAr: 'تلفزيون ذكي سوني 43 بوصة',
        applianceType: 'tv',
        brand: 'Sony',
        model: 'KD-43X85J',
        color: 'Black',
        descriptionEn:
          '43 inch 4K HDR Smart TV with Google TV, Triluminos Pro, and X-Protection PRO. Great for medium rooms.',
        descriptionAr:
          'تلفزيون ذكي 43 بوصة 4K HDR مع Google TV و Triluminos Pro و X-Protection PRO. رائع للغرف المتوسطة.',
        images: [
          'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
        ],
        rentalPrices: {
          oneMonth: 100,
          sixMonths: 170,
          oneYear: 280,
        },
        monthlyPrice: 100,
        deposit: 600,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'الحجم': '43 بوصة',
          'الدقة': '4K HDR',
          'اللون': 'أسود',
        },
      },
      {
        nameEn: 'Whirlpool Top Load Washing Machine',
        nameAr: 'غسالة ويرلبول تحميل علوي',
        applianceType: 'washing_machine',
        brand: 'Whirlpool',
        model: 'WTW5000DW',
        color: 'White',
        descriptionEn:
          '8kg top load washing machine with impeller technology, 12 wash cycles, and deep water wash option.',
        descriptionAr:
          'غسالة تحميل علوي 8 كجم مع تقنية الدفاعة و 12 دورة غسيل وخيار الغسيل بالماء العميق.',
        images: [
          'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400',
        ],
        rentalPrices: {
          oneMonth: 85,
          sixMonths: 150,
          oneYear: 250,
        },
        monthlyPrice: 85,
        deposit: 550,
        minRentalMonths: 3,
        maxRentalMonths: 24,
        status: 'available',
        isAvailable: true,
        specifications: {
          'السعة': '8 كجم',
          'النوع': 'تحميل علوي',
          'اللون': 'أبيض',
        },
      },
    ];

    await this.applianceModel.insertMany(appliances);
    console.log('✅ Appliances seeded successfully - 10 appliances added');
  }
}
