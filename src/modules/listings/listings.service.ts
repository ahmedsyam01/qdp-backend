import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyListing, PropertyListingDocument } from './schemas/property-listing.schema';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { CalculateFeeDto } from './dto/calculate-fee.dto';

@Injectable()
export class ListingsService {
  // Fee structure based on design screen (Add Adv-3.png)
  private readonly EVALUATION_FEE = 20; // Fixed 20 QR for property evaluation
  private readonly AD_DURATION_FEES = {
    '7_days': 20,    // 7 days = 20 QR
    '15_days': 50,   // 15 days = 50 QR
    '30_days': 100,  // 30 days = 100 QR (1 month)
    '90_days': 400,  // 90 days = 400 QR (3 months)
  };

  constructor(
    @InjectModel(PropertyListing.name) private listingModel: Model<PropertyListingDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  /**
   * Calculate listing fee based on ad duration
   * From design: evaluationFee (20 QR) + displayFee (varies by duration)
   */
  calculateFee(calculateFeeDto: CalculateFeeDto) {
    const { adDuration } = calculateFeeDto;
    const displayFee = this.AD_DURATION_FEES[adDuration];
    const evaluationFee = this.EVALUATION_FEE;
    const totalCost = evaluationFee + displayFee;

    return {
      evaluationFee,
      displayFee,
      totalCost,
      breakdown: {
        evaluationFee: {
          label: 'تكلفة تقييم العقار',
          labelEn: 'Property Evaluation Fee',
          amount: evaluationFee,
          currency: 'QAR',
        },
        displayFee: {
          label: `تكلفة ظهور الإعلان (${this.getAdDurationLabel(adDuration)})`,
          labelEn: `Ad Display Fee (${this.getAdDurationLabelEn(adDuration)})`,
          amount: displayFee,
          currency: 'QAR',
        },
        total: {
          label: 'إجمالي التكلفة',
          labelEn: 'Total Cost',
          amount: totalCost,
          currency: 'QAR',
        },
      },
    };
  }

  /**
   * Create a new property listing
   */
  async create(userId: string, createListingDto: CreateListingDto): Promise<PropertyListingDocument> {
    const { propertyId, adDuration } = createListingDto;

    // Calculate fees
    const feeCalculation = this.calculateFee({ adDuration });

    // Create listing
    const listing = new this.listingModel({
      propertyId,
      userId,
      adDuration,
      evaluationFee: feeCalculation.evaluationFee,
      displayFee: feeCalculation.displayFee,
      totalCost: feeCalculation.totalCost,
      status: 'pending', // Pending until payment is completed
      isPaid: false,
    });

    return listing.save();
  }

  /**
   * Find all listings for a user
   */
  async findByUser(userId: string, status?: string): Promise<PropertyListingDocument[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    return this.listingModel
      .find(query)
      .populate('propertyId', 'title titleAr images location price propertyType')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find listing by ID
   */
  async findById(id: string): Promise<PropertyListingDocument> {
    const listing = await this.listingModel
      .findById(id)
      .populate('propertyId')
      .populate('paymentId')
      .exec();

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  /**
   * Update listing status after payment
   */
  async markAsPaid(listingId: string, paymentId: string): Promise<PropertyListingDocument> {
    const listing = await this.findById(listingId);

    // Calculate expiry date based on ad duration
    const publishedAt = new Date();
    const expiresAt = this.calculateExpiryDate(listing.adDuration);

    listing.status = 'active';
    listing.isPaid = true;
    listing.paymentId = paymentId as any;
    listing.publishedAt = publishedAt;
    listing.expiresAt = expiresAt;

    // Also activate the property
    await this.propertyModel.findByIdAndUpdate(listing.propertyId, {
      status: 'active',
      publishedAt: publishedAt,
    });

    return listing.save();
  }

  /**
   * Renew expired listing
   */
  async renew(listingId: string, adDuration: string): Promise<PropertyListingDocument> {
    const listing = await this.findById(listingId);

    if (listing.status !== 'expired') {
      throw new BadRequestException('Only expired listings can be renewed');
    }

    // Calculate new fees
    const feeCalculation = this.calculateFee({ adDuration } as CalculateFeeDto);

    listing.adDuration = adDuration;
    listing.displayFee = feeCalculation.displayFee;
    listing.totalCost = feeCalculation.totalCost;
    listing.status = 'pending';
    listing.isPaid = false;
    listing.publishedAt = undefined;
    listing.expiresAt = undefined;

    return listing.save();
  }

  /**
   * Cancel listing
   */
  async cancel(listingId: string): Promise<PropertyListingDocument> {
    const listing = await this.findById(listingId);
    listing.status = 'cancelled';
    return listing.save();
  }

  /**
   * Get active listings (for public display)
   */
  async findActive(filters?: any): Promise<PropertyListingDocument[]> {
    const query: any = {
      status: 'active',
      expiresAt: { $gt: new Date() },
    };

    return this.listingModel
      .find(query)
      .populate('propertyId')
      .sort({ publishedAt: -1 })
      .exec();
  }

  /**
   * Increment view count
   */
  async incrementViews(listingId: string): Promise<void> {
    await this.listingModel.findByIdAndUpdate(listingId, {
      $inc: { viewsCount: 1 },
    });
  }

  /**
   * Increment contact count
   */
  async incrementContacts(listingId: string): Promise<void> {
    await this.listingModel.findByIdAndUpdate(listingId, {
      $inc: { contactsCount: 1 },
    });
  }

  /**
   * Helper: Calculate expiry date based on ad duration
   */
  private calculateExpiryDate(adDuration: string): Date {
    const now = new Date();
    const daysMap: Record<string, number> = {
      '7_days': 7,
      '15_days': 15,
      '30_days': 30,
      '90_days': 90,
    };
    const days = daysMap[adDuration] || 7;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Helper: Get ad duration label in Arabic
   */
  private getAdDurationLabel(adDuration: string): string {
    const labels: Record<string, string> = {
      '7_days': '7 أيام',
      '15_days': '15 يوم',
      '30_days': 'شهر واحد',
      '90_days': '3 أشهر',
    };
    return labels[adDuration] || adDuration;
  }

  /**
   * Helper: Get ad duration label in English
   */
  private getAdDurationLabelEn(adDuration: string): string {
    const labels: Record<string, string> = {
      '7_days': '7 days',
      '15_days': '15 days',
      '30_days': '1 month',
      '90_days': '3 months',
    };
    return labels[adDuration] || adDuration;
  }
}
