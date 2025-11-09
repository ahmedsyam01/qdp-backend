import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';

@Injectable()
export class AdminContractsService {
  constructor(
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
  ) {}

  async findAll(filters: any) {
    const {
      contractType,
      status,
      page = 1,
      limit = 20,
    } = filters;

    const query: any = {};

    if (contractType) {
      query.contractType = contractType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [contracts, total] = await Promise.all([
      this.contractModel
        .find(query)
        .populate('tenantId', 'fullName phone email')
        .populate('landlordId', 'fullName phone email')
        .populate('propertyId', 'title location images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.contractModel.countDocuments(query),
    ]);

    return {
      contracts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const contract = await this.contractModel
      .findById(id)
      .populate('tenantId', 'fullName phone email identityNumber')
      .populate('landlordId', 'fullName phone email identityNumber')
      .populate('propertyId')
      .lean();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async getStats() {
    const [total, draft, active, expired, cancelled, terminated] = await Promise.all([
      this.contractModel.countDocuments(),
      this.contractModel.countDocuments({ status: 'draft' }),
      this.contractModel.countDocuments({ status: 'active' }),
      this.contractModel.countDocuments({ status: 'expired' }),
      this.contractModel.countDocuments({ status: 'cancelled' }),
      this.contractModel.countDocuments({ status: 'terminated' }),
    ]);

    // Get contracts by type
    const [rent, sale] = await Promise.all([
      this.contractModel.countDocuments({ contractType: 'rent' }),
      this.contractModel.countDocuments({ contractType: 'sale' }),
    ]);

    // Get recent contracts
    const recent = await this.contractModel
      .find()
      .populate('tenantId', 'fullName phone')
      .populate('landlordId', 'fullName phone')
      .populate('propertyId', 'title location')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get contracts expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await this.contractModel
      .find({
        status: 'active',
        endDate: {
          $gte: new Date(),
          $lte: thirtyDaysFromNow,
        },
      })
      .populate('tenantId', 'fullName phone')
      .populate('landlordId', 'fullName phone')
      .populate('propertyId', 'title location')
      .sort({ endDate: 1 })
      .limit(10)
      .lean();

    return {
      total,
      byStatus: {
        draft,
        active,
        expired,
        cancelled,
        terminated,
      },
      byType: {
        rent,
        sale,
      },
      recent,
      expiringSoon,
    };
  }

  async updateStatus(id: string, status: string) {
    const contract = await this.contractModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async approveCancellation(id: string, approved: boolean) {
    const contract = await this.contractModel.findById(id);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (approved) {
      contract.status = 'cancelled';
      contract.cancellationApproved = true;
      contract.cancelledAt = new Date();
    } else {
      // Reject cancellation - clear cancellation request
      contract.cancellationApproved = false;
      await this.contractModel.findByIdAndUpdate(id, {
        $unset: { cancellationRequestedAt: 1, cancellationReason: 1 },
      });
    }

    await contract.save();
    return contract;
  }

  async remove(id: string) {
    const result = await this.contractModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Contract not found');
    }

    return { message: 'Contract deleted successfully' };
  }

  async signAsLandlord(id: string, signature: string) {
    const contract = await this.contractModel.findById(id);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const updateData: any = {
      electronicSignatureLandlord: signature,
      signedAtLandlord: new Date(),
    };

    // Check if both parties have now signed
    const bothSigned = contract.electronicSignatureTenant && signature;

    if (bothSigned) {
      updateData.status = 'active';
    } else {
      updateData.status = 'pending_signature';
    }

    const updatedContract = await this.contractModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return updatedContract;
  }
}
