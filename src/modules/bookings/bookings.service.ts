import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PropertyBooking,
  PropertyBookingDocument,
} from './schemas/property-booking.schema';
import {
  PropertyTransfer,
  PropertyTransferDocument,
} from './schemas/property-transfer.schema';
import { Contract } from '../contracts/schemas/contract.schema';
import { Property } from '../properties/schemas/property.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreatePropertyTransferDto } from './dto/create-property-transfer.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(PropertyBooking.name)
    private bookingModel: Model<PropertyBookingDocument>,
    @InjectModel(PropertyTransfer.name)
    private transferModel: Model<PropertyTransferDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<any>,
    @InjectModel(Property.name)
    private propertyModel: Model<any>,
  ) {}

  // Get user's bookings
  async getUserBookings(userId: string): Promise<PropertyBooking[]> {
    return this.bookingModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('propertyId', 'title location images propertyType category')
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get booking by ID (with ownership check)
  async getBookingById(
    bookingId: string,
    userId: string,
  ): Promise<PropertyBooking> {
    const booking = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(bookingId),
        userId: new Types.ObjectId(userId),
      })
      .populate('propertyId', 'title location images propertyType category')
      .populate('contractId')
      .lean();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  // Check if user has an active booking for a property
  async checkExistingBooking(
    userId: string,
    propertyId: string,
    bookingType?: 'rent' | 'sale',
  ): Promise<PropertyBooking | null> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      propertyId: new Types.ObjectId(propertyId),
      status: { $in: ['pending', 'approved', 'active'] }, // Active statuses
    };

    if (bookingType) {
      query.bookingType = bookingType;
    }

    return this.bookingModel.findOne(query).lean();
  }

  // Get user's transfer requests
  async getUserTransferRequests(userId: string): Promise<PropertyTransfer[]> {
    return this.transferModel
      .find({ requestedBy: new Types.ObjectId(userId) })
      .populate('propertyId', 'title location images')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .lean();
  }

  // Create transfer request
  async createTransferRequest(
    userId: string,
    createTransferDto: CreateTransferDto,
  ): Promise<PropertyTransfer> {
    const { bookingId, newTenantInfo, reason } = createTransferDto;

    // Verify booking exists and belongs to user
    const booking = await this.bookingModel.findOne({
      _id: new Types.ObjectId(bookingId),
      userId: new Types.ObjectId(userId),
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    // Create transfer request
    const transfer = new this.transferModel({
      propertyId: booking.propertyId,
      bookingId: booking._id,
      requestedBy: new Types.ObjectId(userId),
      newTenantInfo,
      reason,
      status: 'pending',
    });

    return transfer.save();
  }

  // Create property transfer request (user wants to move to a different property)
  async createPropertyTransferRequest(
    userId: string,
    createPropertyTransferDto: CreatePropertyTransferDto,
  ): Promise<PropertyTransfer> {
    const { requestedPropertyId, reason } = createPropertyTransferDto;

    // Find user's active RENTAL contract
    const activeContract = await this.contractModel
      .findOne({
        tenantId: new Types.ObjectId(userId),
        status: 'active',
        contractType: 'rent', // Only rental contracts can request transfers
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!activeContract) {
      throw new BadRequestException(
        'You must have an active rental contract to request a property transfer. Property transfers are only available for tenants, not property owners.',
      );
    }

    // Verify current property (from contract) exists
    const currentProperty = await this.propertyModel
      .findById((activeContract as any).propertyId)
      .lean();

    if (!currentProperty) {
      throw new BadRequestException(
        'Your current property no longer exists in the system. Please contact support.',
      );
    }

    // Verify requested property exists and is available for rent
    const requestedProperty = await this.propertyModel
      .findById(requestedPropertyId)
      .lean();

    if (!requestedProperty) {
      throw new NotFoundException('Requested property not found');
    }

    if (
      !(requestedProperty as any).availableFor?.rent ||
      (requestedProperty as any).status !== 'active'
    ) {
      throw new BadRequestException('Requested property is not available for rent');
    }

    // Check if property already has an active contract (double safety check)
    const existingContract = await this.contractModel
      .findOne({
        propertyId: new Types.ObjectId(requestedPropertyId),
        status: 'active',
      })
      .lean();

    if (existingContract) {
      throw new BadRequestException(
        'This property is currently occupied and not available for rent',
      );
    }

    // Check if user is not already requesting to transfer to the same property they're in
    if ((activeContract as any).propertyId.toString() === requestedPropertyId) {
      throw new BadRequestException('You are already in this property');
    }

    // Check if there's already a pending transfer request for this user
    const existingPendingTransfer = await this.transferModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: 'pending',
      })
      .lean();

    if (existingPendingTransfer) {
      throw new BadRequestException(
        'You already have a pending transfer request. Please wait for it to be processed.',
      );
    }

    // Create property transfer request
    const transfer = new this.transferModel({
      userId: new Types.ObjectId(userId),
      currentContractId: (activeContract as any)._id,
      currentPropertyId: (activeContract as any).propertyId,
      requestedPropertyId: new Types.ObjectId(requestedPropertyId),
      reason,
      status: 'pending',
    });

    return transfer.save();
  }
}
