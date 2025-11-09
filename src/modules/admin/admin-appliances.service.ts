import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Appliance,
  ApplianceDocument,
} from '../appliances/schemas/appliance.schema';
import {
  ApplianceBooking,
  ApplianceBookingDocument,
} from '../appliances/schemas/appliance-booking.schema';

@Injectable()
export class AdminAppliancesService {
  constructor(
    @InjectModel(Appliance.name)
    private applianceModel: Model<ApplianceDocument>,
    @InjectModel(ApplianceBooking.name)
    private bookingModel: Model<ApplianceBookingDocument>,
  ) {}

  // ========== Appliances Management ==========

  async findAllAppliances(filters: any) {
    const query: any = {};

    // Filter by type
    if (filters.type) {
      query.applianceType = filters.type;
    }

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      query.monthlyPrice = {};
      if (filters.minPrice) query.monthlyPrice.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.monthlyPrice.$lte = Number(filters.maxPrice);
    }

    // Search by name
    if (filters.search) {
      query.$or = [
        { nameEn: { $regex: filters.search, $options: 'i' } },
        { nameAr: { $regex: filters.search, $options: 'i' } },
        { brand: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [appliances, total] = await Promise.all([
      this.applianceModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.applianceModel.countDocuments(query),
    ]);

    return {
      appliances,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAppliancesStats() {
    const [
      totalAppliances,
      available,
      rented,
      maintenance,
      totalRentals,
      monthlyRevenue,
    ] = await Promise.all([
      this.applianceModel.countDocuments(),
      this.applianceModel.countDocuments({ status: 'available' }),
      this.applianceModel.countDocuments({ status: 'rented' }),
      this.applianceModel.countDocuments({ status: 'maintenance' }),
      this.bookingModel.countDocuments({ status: { $in: ['active', 'completed'] } }),
      this.calculateMonthlyRevenue(),
    ]);

    return {
      totalAppliances,
      available,
      rented,
      maintenance,
      availablePercentage: totalAppliances > 0 ? (available / totalAppliances) * 100 : 0,
      rentedPercentage: totalAppliances > 0 ? (rented / totalAppliances) * 100 : 0,
      totalRentals,
      monthlyRevenue,
    };
  }

  private async calculateMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const activeRentals = await this.bookingModel
      .find({
        status: 'active',
        'installments.status': 'paid',
        'installments.paidAt': { $gte: startOfMonth },
      })
      .lean();

    let revenue = 0;
    for (const rental of activeRentals) {
      if (rental.installments) {
        for (const inst of rental.installments) {
          if (
            inst.status === 'paid' &&
            inst.paidAt &&
            inst.paidAt >= startOfMonth
          ) {
            revenue += inst.paidAmount || inst.amount;
          }
        }
      }
    }

    return revenue;
  }

  async getApplianceDetails(id: string) {
    const appliance = await this.applianceModel.findById(id).lean();

    if (!appliance) {
      throw new NotFoundException('Appliance not found');
    }

    // Get current rental
    const currentRental = await this.bookingModel
      .findOne({
        applianceId: id,
        status: 'active',
      })
      .populate('userId', 'fullName phone email')
      .lean();

    // Get rental stats
    const rentalHistory = await this.bookingModel
      .find({
        applianceId: id,
        status: { $in: ['completed', 'active'] },
      })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 })
      .lean();

    return {
      appliance,
      currentRental,
      rentalHistory,
    };
  }

  async createAppliance(createDto: any, adminId: string) {
    const appliance = new this.applianceModel({
      ...createDto,
      ownerId: adminId,
      status: 'available',
      isAvailable: true,
    });

    await appliance.save();
    return appliance;
  }

  async updateAppliance(id: string, updateDto: any) {
    const appliance = await this.applianceModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { new: true },
    );

    if (!appliance) {
      throw new NotFoundException('Appliance not found');
    }

    return appliance;
  }

  async deleteAppliance(id: string) {
    const appliance = await this.applianceModel.findById(id);

    if (!appliance) {
      throw new NotFoundException('Appliance not found');
    }

    // Check if currently rented
    const activeRental = await this.bookingModel.findOne({
      applianceId: id,
      status: 'active',
    });

    if (activeRental) {
      throw new BadRequestException(
        'Cannot delete appliance that is currently rented',
      );
    }

    // Soft delete by setting status to inactive
    appliance.status = 'inactive';
    appliance.isAvailable = false;
    await appliance.save();

    return { message: 'Appliance deleted successfully' };
  }

  async setMaintenance(id: string, maintenanceDto: any, adminId: string) {
    const appliance = await this.applianceModel.findById(id);

    if (!appliance) {
      throw new NotFoundException('Appliance not found');
    }

    appliance.status = 'maintenance';
    appliance.isAvailable = false;
    appliance.lastMaintenanceDate = maintenanceDto.maintenanceDate || new Date();

    await appliance.save();

    return {
      message: 'Appliance set to maintenance mode',
      appliance,
    };
  }

  async getRentalHistory(id: string, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
      this.bookingModel
        .find({ applianceId: id })
        .populate('userId', 'fullName phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bookingModel.countDocuments({ applianceId: id }),
    ]);

    return {
      rentals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== Rental Requests Management ==========

  async getRentalRequests(filters: any) {
    const query: any = {};

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by appliance type
    if (filters.applianceType) {
      // Need to join with appliances
      const appliances = await this.applianceModel
        .find({ applianceType: filters.applianceType })
        .select('_id')
        .lean();
      query.applianceId = { $in: appliances.map((a) => a._id) };
    }

    // Filter by user
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .populate('applianceId', 'nameEn nameAr applianceType images monthlyPrice')
        .populate('userId', 'fullName phone email')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bookingModel.countDocuments(query),
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRentalRequest(id: string) {
    const request = await this.bookingModel
      .findById(id)
      .populate('applianceId')
      .populate('userId', 'fullName phone email identityNumber')
      .populate('approvedBy', 'fullName email')
      .lean();

    if (!request) {
      throw new NotFoundException('Rental request not found');
    }

    return request;
  }

  async approveRental(id: string, approvalDto: any, adminId: string) {
    const rental = await this.bookingModel.findById(id).populate('applianceId');

    if (!rental) {
      throw new NotFoundException('Rental request not found');
    }

    if (rental.status !== 'pending') {
      throw new BadRequestException('Rental request is not pending');
    }

    // Generate installment schedule
    const installments = this.generateInstallmentSchedule(
      rental.durationMonths || 1,
      rental.monthlyAmount || rental.totalAmount,
      rental.startDate,
    );

    rental.installments = installments;
    rental.status = 'approved';
    rental.approvedBy = adminId as any;
    rental.approvedAt = new Date();
    rental.deliveryAddress = approvalDto.deliveryAddress || rental.deliveryAddress;

    await rental.save();

    // Update appliance status
    await this.applianceModel.findByIdAndUpdate(rental.applianceId, {
      status: 'rented',
      isAvailable: false,
      lastRentalDate: new Date(),
      $inc: { totalRentals: 1, totalMonthsRented: rental.durationMonths || 1 },
    });

    // TODO: Send notification to user

    return {
      message: 'Rental request approved successfully',
      rental,
    };
  }

  private generateInstallmentSchedule(
    durationMonths: number,
    monthlyAmount: number,
    startDate: Date,
  ) {
    const installments = [];
    const start = new Date(startDate);

    for (let i = 0; i < durationMonths; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);

      installments.push({
        installmentNumber: i + 1,
        dueDate,
        amount: monthlyAmount,
        status: 'pending' as const,
        paymentMethod: 'card' as const,
      });
    }

    return installments;
  }

  async rejectRental(id: string, rejectionDto: any, adminId: string) {
    const rental = await this.bookingModel.findById(id);

    if (!rental) {
      throw new NotFoundException('Rental request not found');
    }

    rental.status = 'rejected';
    rental.rejectedAt = new Date();
    rental.rejectionReason = rejectionDto.reason;

    await rental.save();

    // TODO: Send notification to user

    return {
      message: 'Rental request rejected',
      rental,
    };
  }

  // ========== Installments Management ==========

  async getInstallments(rentalId: string) {
    const rental = await this.bookingModel.findById(rentalId).lean();

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    return rental.installments || [];
  }

  async updateInstallment(
    rentalId: string,
    installmentNumber: number,
    updateDto: any,
    adminId: string,
  ) {
    const rental = await this.bookingModel.findById(rentalId);

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    const installment = rental.installments?.find(
      (inst) => inst.installmentNumber === installmentNumber,
    );

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    // Update payment method if provided
    if (updateDto.paymentMethod) {
      installment.paymentMethod = updateDto.paymentMethod;
    }

    // Update other fields if provided
    if (updateDto.status) {
      installment.status = updateDto.status;
    }

    await rental.save();

    return {
      message: 'Installment updated successfully',
      installment,
    };
  }

  async markInstallmentPaid(
    rentalId: string,
    installmentNumber: number,
    paymentData: any,
    adminId: string,
  ) {
    const rental = await this.bookingModel.findById(rentalId).populate('applianceId');

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    const installment = rental.installments?.find(
      (inst) => inst.installmentNumber === installmentNumber,
    );

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    installment.status = 'paid';
    installment.paidAt = paymentData.paidAt || new Date();
    installment.paidAmount = paymentData.paidAmount || installment.amount;
    if (paymentData.paymentId) {
      installment.paymentId = paymentData.paymentId;
    }

    await rental.save();

    // Check if all installments are paid
    const allPaid = rental.installments?.every((inst) => inst.status === 'paid');

    if (allPaid) {
      rental.status = 'completed';
      await rental.save();

      // Return appliance to available
      await this.applianceModel.findByIdAndUpdate(rental.applianceId, {
        status: 'available',
        isAvailable: true,
      });

      // TODO: Update commitment reward
    }

    return {
      message: 'Installment marked as paid',
      installment,
      rentalCompleted: allPaid,
    };
  }
}
