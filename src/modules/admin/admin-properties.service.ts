import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Property } from '../properties/schemas/property.schema';
import { PropertyBooking } from '../bookings/schemas/property-booking.schema';
import { PropertyTransfer } from '../bookings/schemas/property-transfer.schema';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { ApprovePropertyDto } from './dto/approve-property.dto';
import { RejectPropertyDto } from './dto/reject-property.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { FilterTransfersDto } from './dto/filter-transfers.dto';
import { UpdateInstallmentDto, MarkInstallmentPaidDto } from './dto/update-installment.dto';

@Injectable()
export class AdminPropertiesService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel(PropertyBooking.name) private bookingModel: Model<PropertyBooking>,
    @InjectModel(PropertyTransfer.name) private transferModel: Model<PropertyTransfer>,
  ) {}

  // ========== PROPERTIES MANAGEMENT ==========

  async findAllProperties(filters: FilterPropertiesDto) {
    const {
      search,
      status,
      propertyType,
      category,
      city,
      area,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      ownerId,
      isFeatured,
      dateFrom,
      dateTo,
      availableFor,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: any = {};

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (propertyType) query.propertyType = propertyType;
    if (category) query.category = category;
    if (city) query['location.city'] = city;
    if (area) query['location.area'] = area;
    if (ownerId) query.userId = new Types.ObjectId(ownerId);
    if (typeof isFeatured === 'boolean') query.isFeatured = isFeatured;

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Specifications
    if (bedrooms) query['specifications.bedrooms'] = bedrooms;
    if (bathrooms) query['specifications.bathrooms'] = bathrooms;

    // Area range
    if (minArea !== undefined || maxArea !== undefined) {
      query['specifications.areaSqm'] = {};
      if (minArea !== undefined) query['specifications.areaSqm'].$gte = minArea;
      if (maxArea !== undefined) query['specifications.areaSqm'].$lte = maxArea;
    }

    // Date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Available for (rent, sale, or both)
    if (availableFor) {
      if (availableFor === 'rent') {
        query['availableFor.rent'] = true;
      } else if (availableFor === 'sale') {
        query['availableFor.sale'] = true;
      } else if (availableFor === 'both') {
        query['availableFor.rent'] = true;
        query['availableFor.sale'] = true;
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [properties, total] = await Promise.all([
      this.propertyModel
        .find(query)
        .populate('userId', 'fullName phone email profilePicture')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.propertyModel.countDocuments(query),
    ]);

    return {
      data: properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPendingProperties() {
    const properties = await this.propertyModel
      .find({ status: 'pending' })
      .populate('userId', 'fullName phone email profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    return properties;
  }

  async findPropertyById(id: string) {
    const property = await this.propertyModel
      .findById(id)
      .populate('userId', 'fullName phone email profilePicture identityNumber')
      .lean();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Get related bookings and transfers
    const [bookings, transfers] = await Promise.all([
      this.bookingModel
        .find({ propertyId: new Types.ObjectId(id) })
        .populate('userId', 'fullName phone')
        .limit(10)
        .sort({ createdAt: -1 })
        .lean(),
      this.transferModel
        .find({
          $or: [
            { currentPropertyId: new Types.ObjectId(id) },
            { requestedPropertyId: new Types.ObjectId(id) },
          ],
        })
        .populate('userId', 'fullName phone')
        .limit(10)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      ...property,
      bookings,
      transfers,
    };
  }

  async approveProperty(id: string, approvalDto: ApprovePropertyDto, adminId: string) {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.status !== 'pending') {
      throw new BadRequestException('Only pending properties can be approved');
    }

    property.status = 'active';
    property.publishedAt = approvalDto.publishDate ? new Date(approvalDto.publishDate) : new Date();

    if (approvalDto.setFeatured) {
      property.isFeatured = true;
    }

    await property.save();

    // TODO: Send notification to property owner
    // await this.notificationsService.send({
    //   userId: property.userId,
    //   title: 'Property Approved',
    //   message: `Your property "${property.title}" has been approved and is now live.`,
    // });

    return property;
  }

  async rejectProperty(id: string, rejectionDto: RejectPropertyDto, adminId: string) {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    property.status = 'rejected';
    await property.save();

    // TODO: Send notification to property owner with rejection reason
    // await this.notificationsService.send({
    //   userId: property.userId,
    //   title: 'Property Rejected',
    //   message: `Your property "${property.title}" was rejected. Reason: ${rejectionDto.details}`,
    // });

    return property;
  }

  async updateProperty(id: string, updateDto: any) {
    const property = await this.propertyModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { new: true, runValidators: true }
    );

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async deleteProperty(id: string) {
    const property = await this.propertyModel.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return { message: 'Property archived successfully' };
  }

  // ========== BOOKING REQUESTS MANAGEMENT ==========

  async findAllBookings(filters: FilterBookingsDto) {
    const {
      search,
      bookingType,
      status,
      propertyId,
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: any = {};

    if (bookingType) query.bookingType = bookingType;
    if (status) query.status = status;
    if (propertyId) query.propertyId = new Types.ObjectId(propertyId);
    if (userId) query.userId = new Types.ObjectId(userId);

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .populate('propertyId', 'title images availableFor location')
        .populate('userId', 'fullName phone email identityNumber')
        .populate('approvedBy', 'fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bookingModel.countDocuments(query),
    ]);

    return {
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBookingById(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('propertyId')
      .populate('userId', 'fullName phone email identityNumber currentAddress')
      .populate('approvedBy', 'fullName')
      .lean();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async approveBooking(id: string, adminId: string) {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    booking.status = 'approved';
    booking.approvedBy = new Types.ObjectId(adminId);
    booking.approvedAt = new Date();

    // Generate installment schedule for RENT bookings
    if (booking.bookingType === 'rent' && booking.numberOfInstallments > 0) {
      const installments = [];
      const startDate = booking.startDate || new Date();

      for (let i = 1; i <= booking.numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i - 1);

        installments.push({
          installmentNumber: i,
          dueDate,
          amount: booking.monthlyAmount,
          status: 'pending' as 'pending',
          paymentMethod: 'card' as 'card', // Default to card
        });
      }

      booking.installments = installments;
    }

    await booking.save();

    // TODO: Create contract
    // TODO: Send notification to user

    return booking;
  }

  async rejectBooking(id: string, reason: string, adminId: string) {
    const booking = await this.bookingModel.findById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason;
    await booking.save();

    // TODO: Send notification to user

    return booking;
  }

  // ========== INSTALLMENTS MANAGEMENT ==========

  async updateInstallment(
    bookingId: string,
    installmentNumber: number,
    updateDto: UpdateInstallmentDto
  ) {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const installment = booking.installments.find(
      (inst) => inst.installmentNumber === installmentNumber
    );

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    // Update installment fields
    if (updateDto.paymentMethod) installment.paymentMethod = updateDto.paymentMethod as any;
    if (updateDto.status) installment.status = updateDto.status as any;
    if (updateDto.notes) installment.notes = updateDto.notes;

    await booking.save();

    return booking;
  }

  async markInstallmentPaid(
    bookingId: string,
    installmentNumber: number,
    paymentData: MarkInstallmentPaidDto
  ) {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const installment = booking.installments.find(
      (inst) => inst.installmentNumber === installmentNumber
    );

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    installment.status = 'paid' as 'paid';
    installment.paidAmount = paymentData.paidAmount;
    installment.paidAt = paymentData.paidAt ? new Date(paymentData.paidAt) : new Date();
    if (paymentData.receiptUrl) installment.receiptUrl = paymentData.receiptUrl;
    if (paymentData.notes) installment.notes = paymentData.notes;

    await booking.save();

    // TODO: Update commitment rewards if paid on time

    return booking;
  }

  async getAllInstallments(filters: any) {
    const { status, paymentMethod, propertyId, userId, dueDateFrom, dueDateTo } = filters;

    const query: any = {};

    if (status) query['installments.status'] = status;
    if (paymentMethod) query['installments.paymentMethod'] = paymentMethod;
    if (propertyId) query.propertyId = new Types.ObjectId(propertyId);
    if (userId) query.userId = new Types.ObjectId(userId);

    const bookings = await this.bookingModel
      .find({ ...query, bookingType: 'rent' })
      .populate('propertyId', 'title')
      .populate('userId', 'fullName phone')
      .lean();

    // Flatten installments
    const allInstallments = [];
    for (const booking of bookings) {
      for (const installment of booking.installments) {
        allInstallments.push({
          ...installment,
          bookingId: booking._id,
          property: booking.propertyId,
          user: booking.userId,
        });
      }
    }

    return allInstallments;
  }

  // ========== TRANSFER REQUESTS MANAGEMENT ==========

  async findAllTransfers(filters: FilterTransfersDto) {
    const {
      search,
      status,
      userId,
      propertyId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = filters;

    const query: any = {};

    if (status) query.status = status;
    if (userId) query.userId = new Types.ObjectId(userId);
    if (propertyId) {
      query.$or = [
        { currentPropertyId: new Types.ObjectId(propertyId) },
        { requestedPropertyId: new Types.ObjectId(propertyId) },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      this.transferModel
        .find(query)
        .populate('userId', 'fullName phone email')
        .populate('currentPropertyId', 'title images availableFor location')
        .populate('requestedPropertyId', 'title images availableFor location')
        .populate('currentContractId')
        .populate('approvedBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.transferModel.countDocuments(query),
    ]);

    return {
      data: transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTransferById(id: string) {
    const transfer = await this.transferModel
      .findById(id)
      .populate('userId', 'fullName phone email identityNumber')
      .populate('currentPropertyId')
      .populate('requestedPropertyId')
      .populate('currentContractId')
      .populate('approvedBy', 'fullName')
      .lean();

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Check eligibility
    const eligibility = await this.checkTransferEligibility(transfer);

    return {
      ...transfer,
      eligibilityCheck: eligibility,
    };
  }

  private async checkTransferEligibility(transfer: any) {
    const requestedProperty: any = transfer.requestedPropertyId;

    // Check 1: Similar unit available
    const similarUnitAvailable = requestedProperty.status === 'active';

    // Check 2 & 3: No late payments and all installments paid
    const booking = await this.bookingModel
      .findOne({
        userId: transfer.userId,
        propertyId: transfer.currentPropertyId,
        bookingType: 'rent',
        status: { $in: ['approved', 'active'] },
      })
      .lean();

    let noLatePayments = true;
    let allInstallmentsPaid = true;
    const paymentHistory = [];

    if (booking && booking.installments) {
      const now = new Date();

      for (const inst of booking.installments) {
        const dueDate = new Date(inst.dueDate);

        if (inst.status === 'pending' && dueDate < now) {
          noLatePayments = false;
        }

        if (inst.status !== 'paid' && dueDate <= now) {
          allInstallmentsPaid = false;
        }

        if (inst.status === 'paid') {
          const paidDate = inst.paidAt ? new Date(inst.paidAt) : dueDate;
          const daysLate = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          paymentHistory.push({
            month: dueDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            status: daysLate > 0 ? 'late' : 'on_time',
            daysLate: daysLate > 0 ? daysLate : undefined,
          });
        }
      }
    }

    return {
      similarUnitAvailable,
      noLatePayments,
      allInstallmentsPaid,
      paymentHistory,
      message: this.getEligibilityMessage({
        similarUnitAvailable,
        noLatePayments,
        allInstallmentsPaid,
      }),
    };
  }

  private getEligibilityMessage(checks: any): string {
    const failed = [];
    if (!checks.similarUnitAvailable) failed.push('Requested property not available');
    if (!checks.noLatePayments) failed.push('User has late payments');
    if (!checks.allInstallmentsPaid) failed.push('Not all installments are paid');

    if (failed.length === 0) {
      return 'All eligibility criteria met. Transfer can be approved.';
    }

    return `Cannot approve: ${failed.join(', ')}`;
  }

  async approveTransfer(id: string, adminId: string) {
    const transfer = await this.transferModel.findById(id)
      .populate('currentPropertyId')
      .populate('requestedPropertyId')
      .populate('currentContractId');

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Check eligibility
    const eligibility = await this.checkTransferEligibility(transfer);

    if (!eligibility.similarUnitAvailable ||
        !eligibility.noLatePayments || !eligibility.allInstallmentsPaid) {
      throw new BadRequestException(eligibility.message);
    }

    transfer.status = 'approved';
    transfer.approvedBy = new Types.ObjectId(adminId);
    transfer.approvedAt = new Date();

    await transfer.save();

    // TODO: Update contract to reference new property
    // TODO: Update property statuses
    // TODO: Send notification to user

    return transfer;
  }

  async rejectTransfer(id: string, reason: string, adminId: string) {
    const transfer = await this.transferModel.findById(id);

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    transfer.status = 'rejected';
    transfer.rejectionReason = reason;
    await transfer.save();

    // TODO: Send notification to user

    return transfer;
  }

  async requestMoreInfo(id: string, message: string, adminId: string) {
    const transfer = await this.transferModel.findById(id);

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    transfer.status = 'awaiting_info';
    transfer.requestedMessage = message;
    await transfer.save();

    // TODO: Send notification to user

    return transfer;
  }
}
