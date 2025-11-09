import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument } from './schemas/contract.schema';
import { PropertyBooking, PropertyBookingDocument } from '../bookings/schemas/property-booking.schema';
import { CreateContractDto } from './dto/create-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import { CancelContractDto } from './dto/cancel-contract.dto';
import {
  RENTAL_CONTRACT_TERMS_AR,
  RENTAL_CONTRACT_HEADER_AR,
} from './templates/rental-contract-ar';
import {
  SALE_CONTRACT_TERMS_AR,
  SALE_CONTRACT_HEADER_AR,
} from './templates/sale-contract-ar';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
    @InjectModel(PropertyBooking.name)
    private bookingModel: Model<PropertyBookingDocument>,
  ) {}

  /**
   * Create a new contract (draft status)
   * Also creates a PropertyBooking record for admin panel tracking
   */
  async create(createContractDto: CreateContractDto): Promise<Contract> {
    // Check if user already has an active booking for this property
    const existingBooking = await this.bookingModel.findOne({
      userId: createContractDto.tenantId,
      propertyId: createContractDto.propertyId,
      bookingType: createContractDto.contractType,
      status: { $in: ['pending', 'approved', 'active'] },
    });

    if (existingBooking) {
      throw new BadRequestException(
        'لديك حجز نشط بالفعل لهذا العقار. لا يمكنك حجز نفس العقار مرتين.',
      );
    }

    // Validate contract type specific requirements
    if (createContractDto.contractType === 'rent') {
      if (!createContractDto.endDate) {
        throw new BadRequestException(
          'End date is required for rental contracts',
        );
      }
      if (!createContractDto.numberOfChecks) {
        throw new BadRequestException(
          'Number of checks is required for rental contracts',
        );
      }
    }

    // Generate contract terms based on type
    const terms = this.generateContractTerms(createContractDto);

    const contract = new this.contractModel({
      ...createContractDto,
      terms,
      status: 'draft',
      insuranceAmount:
        createContractDto.insuranceAmount ||
        createContractDto.amount, // Default to 1 month rent/sale price
      loyaltyBonus: createContractDto.loyaltyBonus ?? true,
      allowUnitTransfer: createContractDto.allowUnitTransfer ?? true,
    });

    const savedContract = await contract.save();

    // Create PropertyBooking record for admin panel
    await this.createPropertyBooking(savedContract);

    return savedContract;
  }

  /**
   * Create PropertyBooking record for admin tracking
   */
  private async createPropertyBooking(contract: ContractDocument): Promise<void> {
    // Convert IDs to ObjectIds explicitly to ensure proper type in database
    const propertyId = Types.ObjectId.isValid(contract.propertyId)
      ? new Types.ObjectId(contract.propertyId.toString())
      : contract.propertyId;
    const userId = Types.ObjectId.isValid(contract.tenantId)
      ? new Types.ObjectId(contract.tenantId.toString())
      : contract.tenantId;

    const bookingData: any = {
      propertyId,
      userId,
      bookingType: contract.contractType,
      totalAmount: contract.amount,
      startDate: contract.startDate,
      status: 'approved', // Auto-approve since user already paid
      contractId: contract._id,
      approvedAt: new Date(),
    };

    // Add rent-specific fields
    if (contract.contractType === 'rent') {
      const numberOfInstallments = contract.numberOfChecks || 12;
      const monthlyAmount = contract.amount / numberOfInstallments;

      bookingData.endDate = contract.endDate;
      bookingData.monthlyAmount = monthlyAmount;
      bookingData.numberOfInstallments = numberOfInstallments;
      bookingData.insuranceDeposit = contract.insuranceAmount;

      // Generate installments schedule
      const installments = [];
      const startDate = new Date(contract.startDate);

      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          installmentNumber: i,
          dueDate,
          amount: monthlyAmount,
          status: i === 1 ? 'paid' : 'pending', // First installment paid during checkout
          paymentMethod: 'card',
          paidAt: i === 1 ? new Date() : undefined,
          paidAmount: i === 1 ? monthlyAmount : undefined,
        });
      }

      bookingData.installments = installments;
    }

    const booking = new this.bookingModel(bookingData);
    await booking.save();
  }

  /**
   * Find all contracts with optional filters
   */
  async findAll(filters?: any): Promise<Contract[]> {
    const query = filters || {};
    return this.contractModel
      .find(query)
      .populate('propertyId', 'title location images price')
      .populate('tenantId', 'fullName phone email')
      .populate('landlordId', 'fullName phone email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find contract by ID
   */
  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractModel
      .findById(id)
      .populate('propertyId')
      .populate('tenantId', 'fullName phone email identityNumber')
      .populate('landlordId', 'fullName phone email identityNumber')
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  /**
   * Find contracts by user (as tenant or landlord)
   */
  async findByUser(userId: string): Promise<Contract[]> {
    return this.contractModel
      .find({
        $or: [{ tenantId: userId }, { landlordId: userId }],
      })
      .populate('propertyId', 'title location images price')
      .populate('tenantId', 'fullName phone')
      .populate('landlordId', 'fullName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find contracts by property
   */
  async findByProperty(propertyId: string): Promise<Contract[]> {
    return this.contractModel
      .find({ propertyId })
      .populate('tenantId', 'fullName phone')
      .populate('landlordId', 'fullName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Sign contract (electronic signature)
   */
  async signContract(
    contractId: string,
    userId: string,
    signDto: SignContractDto,
  ): Promise<Contract | null> {
    const contract = await this.findOne(contractId);

    // Verify user is authorized to sign
    // Handle both populated and unpopulated ObjectIds
    const tenantIdStr = typeof contract.tenantId === 'object' && contract.tenantId !== null
      ? (contract.tenantId as any)._id?.toString() || (contract.tenantId as any).toString()
      : String(contract.tenantId);
    const landlordIdStr = typeof contract.landlordId === 'object' && contract.landlordId !== null
      ? (contract.landlordId as any)._id?.toString() || (contract.landlordId as any).toString()
      : String(contract.landlordId);

    const isTenant = tenantIdStr === userId;
    const isLandlord = landlordIdStr === userId;

    if (!isTenant && !isLandlord) {
      throw new ForbiddenException('You are not authorized to sign this contract');
    }

    // Verify signer role matches
    if (signDto.signerRole === 'tenant' && !isTenant) {
      throw new BadRequestException('User is not the tenant');
    }
    if (signDto.signerRole === 'landlord' && !isLandlord) {
      throw new BadRequestException('User is not the landlord');
    }

    // Update signature
    const updateData: any = {};
    if (signDto.signerRole === 'tenant') {
      updateData.electronicSignatureTenant = signDto.signature;
      updateData.signedAtTenant = new Date();
    } else {
      updateData.electronicSignatureLandlord = signDto.signature;
      updateData.signedAtLandlord = new Date();
    }

    // Check if both parties have signed
    const bothSigned =
      (contract.electronicSignatureTenant || signDto.signerRole === 'tenant') &&
      (contract.electronicSignatureLandlord || signDto.signerRole === 'landlord');

    if (bothSigned) {
      updateData.status = 'active';
    } else {
      updateData.status = 'pending_signature';
    }

    return this.contractModel
      .findByIdAndUpdate(contractId, updateData, { new: true })
      .populate('propertyId')
      .populate('tenantId')
      .populate('landlordId')
      .exec();
  }

  /**
   * Request contract cancellation
   */
  async requestCancellation(
    contractId: string,
    userId: string,
    cancelDto: CancelContractDto,
  ): Promise<Contract | null> {
    const contract = await this.findOne(contractId);

    // Verify user is part of the contract
    const isTenant = contract.tenantId.toString() === userId;
    const isLandlord = contract.landlordId.toString() === userId;

    if (!isTenant && !isLandlord) {
      throw new ForbiddenException(
        'You are not authorized to cancel this contract',
      );
    }

    // Contract must be active to cancel
    if (contract.status !== 'active') {
      throw new BadRequestException(
        'Only active contracts can be cancelled',
      );
    }

    return this.contractModel
      .findByIdAndUpdate(
        contractId,
        {
          cancellationReason: cancelDto.cancellationReason,
          cancellationRequestedAt: new Date(),
          cancelledBy: userId,
          cancellationApproved: false,
        },
        { new: true },
      )
      .populate('propertyId')
      .populate('tenantId')
      .populate('landlordId')
      .exec();
  }

  /**
   * Approve or reject contract cancellation
   */
  async approveCancellation(
    contractId: string,
    userId: string,
    approved: boolean,
  ): Promise<Contract | null> {
    const contract = await this.findOne(contractId);

    // Must have a cancellation request
    if (!contract.cancellationRequestedAt) {
      throw new BadRequestException('No cancellation request found');
    }

    // The other party must approve
    const requesterIsLandlord =
      contract.cancelledBy.toString() === contract.landlordId.toString();
    const approverIsLandlord =
      userId === contract.landlordId.toString();

    if (requesterIsLandlord === approverIsLandlord) {
      throw new ForbiddenException(
        'You cannot approve your own cancellation request',
      );
    }

    const updateData: any = {
      cancellationApproved: approved,
    };

    if (approved) {
      updateData.status = 'cancelled';
      updateData.cancelledAt = new Date();
    } else {
      // Reset cancellation request
      updateData.cancellationReason = null;
      updateData.cancellationRequestedAt = null;
      updateData.cancelledBy = null;
    }

    return this.contractModel
      .findByIdAndUpdate(contractId, updateData, { new: true })
      .populate('propertyId')
      .populate('tenantId')
      .populate('landlordId')
      .exec();
  }

  /**
   * Update contract status
   */
  async updateStatus(
    contractId: string,
    status: string,
  ): Promise<Contract | null> {
    const validStatuses = [
      'draft',
      'pending_signature',
      'active',
      'completed',
      'cancelled',
      'terminated',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return this.contractModel
      .findByIdAndUpdate(contractId, { status }, { new: true })
      .exec();
  }

  /**
   * Delete contract (only drafts)
   */
  async remove(contractId: string, userId: string): Promise<void> {
    const contract = await this.findOne(contractId);

    // Only landlord/seller can delete
    if (contract.landlordId.toString() !== userId) {
      throw new ForbiddenException(
        'Only the landlord can delete this contract',
      );
    }

    // Only drafts can be deleted
    if (contract.status !== 'draft') {
      throw new BadRequestException('Only draft contracts can be deleted');
    }

    await this.contractModel.findByIdAndDelete(contractId).exec();
  }

  /**
   * Generate contract terms based on type and parameters
   */
  private generateContractTerms(dto: CreateContractDto): string[] {
    if (dto.contractType === 'rent') {
      return RENTAL_CONTRACT_TERMS_AR({
        startDate: dto.startDate.toLocaleDateString('ar-QA'),
        endDate: dto.endDate?.toLocaleDateString('ar-QA') || '',
        amount: dto.amount,
        numberOfChecks: dto.numberOfChecks || 12,
        insuranceAmount: dto.insuranceAmount || dto.amount,
      });
    } else {
      return SALE_CONTRACT_TERMS_AR({
        purchaseDate: dto.startDate.toLocaleDateString('ar-QA'),
        salePrice: dto.amount,
        insuranceAmount: dto.insuranceAmount || dto.amount * 0.1,
      });
    }
  }

  /**
   * Get contract statistics for a user
   */
  async getStatistics(userId: string) {
    const contracts = await this.contractModel
      .find({
        $or: [{ tenantId: userId }, { landlordId: userId }],
      })
      .exec();

    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === 'active').length,
      pending: contracts.filter((c) => c.status === 'pending_signature')
        .length,
      completed: contracts.filter((c) => c.status === 'completed').length,
      cancelled: contracts.filter((c) => c.status === 'cancelled').length,
      asLandlord: contracts.filter(
        (c) => c.landlordId.toString() === userId,
      ).length,
      asTenant: contracts.filter((c) => c.tenantId.toString() === userId)
        .length,
    };
  }
}
