import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appliance, ApplianceDocument } from './schemas/appliance.schema';
import {
  ApplianceBooking,
  ApplianceBookingDocument,
} from './schemas/appliance-booking.schema';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { UpdateApplianceDto } from './dto/update-appliance.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryAppliancesDto } from './dto/query-appliances.dto';

@Injectable()
export class AppliancesService {
  constructor(
    @InjectModel(Appliance.name)
    private applianceModel: Model<ApplianceDocument>,
    @InjectModel(ApplianceBooking.name)
    private bookingModel: Model<ApplianceBookingDocument>,
  ) {}

  async create(createApplianceDto: CreateApplianceDto): Promise<Appliance> {
    const appliance = new this.applianceModel(createApplianceDto);
    return appliance.save();
  }

  async findAll(query: QueryAppliancesDto): Promise<Appliance[]> {
    const filter: any = { isAvailable: true };

    if (query.applianceType) {
      filter.applianceType = query.applianceType;
    }

    if (query.brand) {
      filter.brand = query.brand;
    }

    if (query.search) {
      filter.$or = [
        { nameEn: { $regex: query.search, $options: 'i' } },
        { nameAr: { $regex: query.search, $options: 'i' } },
        { brand: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.applianceModel
      .find(filter)
      .populate('ownerId', 'fullName phone email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Appliance> {
    const appliance = await this.applianceModel
      .findById(id)
      .populate('ownerId', 'fullName phone email')
      .exec();

    if (!appliance) {
      throw new NotFoundException(`Appliance with ID ${id} not found`);
    }

    return appliance;
  }

  async update(
    id: string,
    updateApplianceDto: UpdateApplianceDto,
  ): Promise<Appliance> {
    const appliance = await this.applianceModel
      .findByIdAndUpdate(id, updateApplianceDto, { new: true })
      .exec();

    if (!appliance) {
      throw new NotFoundException(`Appliance with ID ${id} not found`);
    }

    return appliance;
  }

  async remove(id: string): Promise<void> {
    const result = await this.applianceModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Appliance with ID ${id} not found`);
    }
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.applianceModel.findByIdAndUpdate(id, {
      $inc: { viewsCount: 1 },
    });
  }

  async bookAppliance(
    applianceId: string,
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<ApplianceBooking> {
    const appliance = await this.applianceModel.findById(applianceId);

    if (!appliance) {
      throw new NotFoundException('Appliance not found');
    }

    if (!appliance.isAvailable) {
      throw new BadRequestException('Appliance is not available for booking');
    }

    // Calculate end date based on rental duration
    const startDate = new Date(createBookingDto.startDate);
    let endDate = new Date(startDate);

    switch (createBookingDto.rentalDuration) {
      case '1_month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '6_months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1_year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Get total amount based on rental duration
    let totalAmount = 0;
    switch (createBookingDto.rentalDuration) {
      case '1_month':
        totalAmount = appliance.rentalPrices.oneMonth;
        break;
      case '6_months':
        totalAmount = appliance.rentalPrices.sixMonths;
        break;
      case '1_year':
        totalAmount = appliance.rentalPrices.oneYear;
        break;
    }

    const booking = new this.bookingModel({
      applianceId,
      userId,
      rentalDuration: createBookingDto.rentalDuration,
      startDate,
      endDate,
      timeSlot: createBookingDto.timeSlot,
      totalAmount,
      notes: createBookingDto.notes,
      status: 'pending',
    });

    return booking.save();
  }

  async getUserBookings(userId: string): Promise<ApplianceBooking[]> {
    return this.bookingModel
      .find({ userId })
      .populate({
        path: 'applianceId',
        select: 'nameEn nameAr brand model color images rentalPrices',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getBookingById(
    bookingId: string,
    userId: string,
  ): Promise<ApplianceBooking> {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, userId })
      .populate({
        path: 'applianceId',
        select: 'nameEn nameAr brand model color images rentalPrices',
      })
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
  ): Promise<ApplianceBooking> {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, userId })
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    if (reason) {
      booking.cancellationReason = reason;
    }

    return booking.save();
  }

  async getAllBookings(filters?: any): Promise<ApplianceBooking[]> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.applianceId) {
      query.applianceId = filters.applianceId;
    }

    return this.bookingModel
      .find(query)
      .populate('userId', 'fullName phone email')
      .populate('applianceId', 'nameEn nameAr brand model')
      .sort({ createdAt: -1 })
      .exec();
  }
}
