import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode, PromoCodeDocument } from '../../modules/promo-codes/schemas/promo-code.schema';

@Injectable()
export class PromoCodeSeeder {
  constructor(
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  async seed() {
    const count = await this.promoCodeModel.countDocuments();
    if (count > 0) {
      console.log('✅ Promo codes already seeded');
      return;
    }

    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const promoCodes = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 100,
        maxDiscountAmount: 50,
        validFrom: now,
        validUntil: oneMonthLater,
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
        applicableFor: 'all',
        description: '10% off for new users',
        descriptionAr: 'خصم 10% للمستخدمين الجدد',
      },
      {
        code: 'LISTING20',
        discountType: 'percentage',
        discountValue: 20,
        minPurchaseAmount: 200,
        maxDiscountAmount: 80,
        validFrom: now,
        validUntil: oneMonthLater,
        usageLimit: 50,
        usageCount: 0,
        isActive: true,
        applicableFor: 'listing',
        description: '20% off on property listing fees',
        descriptionAr: 'خصم 20% على رسوم إعلانات العقارات',
      },
      {
        code: 'SAVE50',
        discountType: 'fixed',
        discountValue: 50,
        minPurchaseAmount: 150,
        validFrom: now,
        validUntil: oneMonthLater,
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
        applicableFor: 'all',
        description: 'Save 50 QAR on your purchase',
        descriptionAr: 'وفر 50 ريال قطري على مشترياتك',
      },
      {
        code: 'PROPERTY30',
        discountType: 'percentage',
        discountValue: 30,
        minPurchaseAmount: 300,
        maxDiscountAmount: 150,
        validFrom: now,
        validUntil: oneMonthLater,
        usageLimit: 30,
        usageCount: 0,
        isActive: true,
        applicableFor: 'listing',
        description: '30% off for premium property listings',
        descriptionAr: 'خصم 30% على إعلانات العقارات المميزة',
      },
      {
        code: 'NEWYEAR2025',
        discountType: 'percentage',
        discountValue: 25,
        minPurchaseAmount: 200,
        maxDiscountAmount: 100,
        validFrom: now,
        validUntil: new Date('2025-12-31'),
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
        applicableFor: 'all',
        description: 'New Year 2025 Special Offer',
        descriptionAr: 'عرض رأس السنة 2025 الخاص',
      },
    ];

    await this.promoCodeModel.insertMany(promoCodes);
    console.log('✅ Promo codes seeded successfully');
  }
}
