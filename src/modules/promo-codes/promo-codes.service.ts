import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode, PromoCodeDocument } from './schemas/promo-code.schema';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  /**
   * Create a new promo code (Admin only)
   */
  async create(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCodeDocument> {
    const { code } = createPromoCodeDto;

    // Check if code already exists
    const existingCode = await this.promoCodeModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new BadRequestException('Promo code already exists');
    }

    const promoCode = new this.promoCodeModel({
      ...createPromoCodeDto,
      code: code.toUpperCase(),
    });

    return promoCode.save();
  }

  /**
   * Validate and calculate discount for a promo code
   */
  async validateAndCalculateDiscount(validateDto: ValidatePromoCodeDto): Promise<{
    isValid: boolean;
    discount: number;
    message?: string;
    messageAr?: string;
    promoCode?: PromoCodeDocument;
  }> {
    const { code, purchaseAmount, paymentType } = validateDto;

    // Find promo code
    const promoCode = await this.promoCodeModel.findOne({
      code: code.toUpperCase(),
    });

    if (!promoCode) {
      return {
        isValid: false,
        discount: 0,
        message: 'Invalid promo code',
        messageAr: 'كود الخصم غير صحيح',
      };
    }

    // Check if active
    if (!promoCode.isActive) {
      return {
        isValid: false,
        discount: 0,
        message: 'Promo code is not active',
        messageAr: 'كود الخصم غير نشط',
      };
    }

    // Check validity period
    const now = new Date();
    if (promoCode.validFrom && promoCode.validFrom > now) {
      return {
        isValid: false,
        discount: 0,
        message: 'Promo code is not yet valid',
        messageAr: 'كود الخصم غير صالح بعد',
      };
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return {
        isValid: false,
        discount: 0,
        message: 'Promo code has expired',
        messageAr: 'انتهت صلاحية كود الخصم',
      };
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return {
        isValid: false,
        discount: 0,
        message: 'Promo code usage limit reached',
        messageAr: 'تم الوصول إلى حد استخدام كود الخصم',
      };
    }

    // Check minimum purchase amount
    if (promoCode.minPurchaseAmount && purchaseAmount < promoCode.minPurchaseAmount) {
      return {
        isValid: false,
        discount: 0,
        message: `Minimum purchase amount is ${promoCode.minPurchaseAmount} QAR`,
        messageAr: `الحد الأدنى للشراء هو ${promoCode.minPurchaseAmount} ر.ق`,
      };
    }

    // Check if applicable for payment type
    if (
      paymentType &&
      promoCode.applicableFor !== 'all' &&
      promoCode.applicableFor !== paymentType
    ) {
      return {
        isValid: false,
        discount: 0,
        message: 'Promo code is not applicable for this type of purchase',
        messageAr: 'كود الخصم غير قابل للتطبيق على هذا النوع من الشراء',
      };
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.discountType === 'fixed') {
      discount = promoCode.discountValue;
    } else if (promoCode.discountType === 'percentage') {
      discount = (purchaseAmount * promoCode.discountValue) / 100;

      // Apply max discount limit if set
      if (promoCode.maxDiscountAmount && discount > promoCode.maxDiscountAmount) {
        discount = promoCode.maxDiscountAmount;
      }
    }

    // Ensure discount doesn't exceed purchase amount
    if (discount > purchaseAmount) {
      discount = purchaseAmount;
    }

    return {
      isValid: true,
      discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
      message: `Discount of ${discount} QAR applied`,
      messageAr: `تم تطبيق خصم ${discount} ر.ق`,
      promoCode,
    };
  }

  /**
   * Increment usage count after successful payment
   */
  async incrementUsage(code: string): Promise<void> {
    await this.promoCodeModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
    );
  }

  /**
   * Find all promo codes (Admin only)
   */
  async findAll(filters?: any): Promise<PromoCodeDocument[]> {
    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return this.promoCodeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Find promo code by ID
   */
  async findById(id: string): Promise<PromoCodeDocument> {
    const promoCode = await this.promoCodeModel.findById(id).exec();

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  /**
   * Update promo code (Admin only)
   */
  async update(id: string, updateDto: Partial<CreatePromoCodeDto>): Promise<PromoCodeDocument> {
    const promoCode = await this.findById(id);

    Object.assign(promoCode, updateDto);

    if (updateDto.code) {
      promoCode.code = updateDto.code.toUpperCase();
    }

    return promoCode.save();
  }

  /**
   * Delete promo code (Admin only)
   */
  async delete(id: string): Promise<void> {
    const result = await this.promoCodeModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Promo code not found');
    }
  }

  /**
   * Deactivate promo code
   */
  async deactivate(id: string): Promise<PromoCodeDocument> {
    const promoCode = await this.findById(id);
    promoCode.isActive = false;
    return promoCode.save();
  }

  /**
   * Activate promo code
   */
  async activate(id: string): Promise<PromoCodeDocument> {
    const promoCode = await this.findById(id);
    promoCode.isActive = true;
    return promoCode.save();
  }
}
