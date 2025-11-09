import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PropertyTransfer,
  PropertyTransferDocument,
} from '../../modules/bookings/schemas/property-transfer.schema';
import {
  PropertyBooking,
  PropertyBookingDocument,
} from '../../modules/bookings/schemas/property-booking.schema';
import {
  Property,
  PropertyDocument,
} from '../../modules/properties/schemas/property.schema';
import {
  Contract,
  ContractDocument,
} from '../../modules/contracts/schemas/contract.schema';

@Injectable()
export class PropertyTransferSeeder {
  constructor(
    @InjectModel(PropertyTransfer.name)
    private transferModel: Model<PropertyTransferDocument>,
    @InjectModel(PropertyBooking.name)
    private bookingModel: Model<PropertyBookingDocument>,
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
  ) {}

  async seed() {
    const count = await this.transferModel.countDocuments();
    if (count > 0) {
      console.log('⚠️  Property transfers already exist. Skipping seed.');
      return;
    }

    // Get approved rent bookings (active tenants)
    const approvedBookings = await this.bookingModel
      .find({
        bookingType: 'rent',
        status: 'approved',
      })
      .populate('userId')
      .populate('propertyId')
      .limit(5)
      .lean();

    if (approvedBookings.length === 0) {
      console.log('⚠️  No approved rent bookings found. Skipping transfer seed.');
      return;
    }

    // Get available rent properties for transfer destination
    const availableProperties = await this.propertyModel
      .find({
        'availableFor.rent': true,
        status: 'active',
      })
      .limit(10)
      .lean();

    if (availableProperties.length < 2) {
      console.log('⚠️  Not enough available properties. Skipping transfer seed.');
      return;
    }

    // Try to find contracts for bookings
    const contracts = await this.contractModel.find().limit(5).lean();

    const transfers: any[] = [];

    for (let i = 0; i < Math.min(approvedBookings.length, 5); i++) {
      const booking: any = approvedBookings[i];
      const currentProperty: any = booking.propertyId;

      // Find a different property for transfer
      const requestedProperty: any = availableProperties.find(
        (p: any) => p._id.toString() !== currentProperty._id.toString()
      ) || availableProperties[0];

      // Check payment history from installments
      const paidInstallments = booking.installments.filter(
        (inst: any) => inst.status === 'paid'
      );
      const lateInstallments = booking.installments.filter(
        (inst: any) => {
          if (inst.status === 'paid' && inst.paidAt) {
            const dueDate = new Date(inst.dueDate);
            const paidDate = new Date(inst.paidAt);
            return paidDate > dueDate;
          }
          return false;
        }
      );

      const paymentHistory = booking.installments.slice(0, 6).map((inst: any) => {
        if (inst.status === 'paid') {
          const dueDate = new Date(inst.dueDate);
          const paidDate = new Date(inst.paidAt);
          const daysLate = Math.floor(
            (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            month: dueDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
            status: daysLate > 0 ? 'late' : 'on_time',
            daysLate: daysLate > 0 ? daysLate : undefined,
          };
        }
        return {
          month: new Date(inst.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
          status: 'on_time',
        };
      });

      // Determine eligibility
      const currentRent = currentProperty.availableFor?.rentPrice || 0;
      const requestedRent = requestedProperty.availableFor?.rentPrice || 0;
      const sameOrLowerRent = requestedRent <= currentRent;
      const noLatePayments = lateInstallments.length === 0;
      const allInstallmentsPaid = paidInstallments.length >= 3; // At least 3 months paid

      // Use first contract if available, otherwise create placeholder
      const contract: any = contracts[i % contracts.length];
      const contractId = contract ? new Types.ObjectId(contract._id as any) : new Types.ObjectId();

      const transfer = {
        userId: booking.userId._id || booking.userId,
        currentContractId: contractId,
        currentPropertyId: new Types.ObjectId(currentProperty._id),
        requestedPropertyId: new Types.ObjectId(requestedProperty._id),
        reason: i % 3 === 0
          ? 'Closer to workplace - I recently changed jobs and the new location is closer to the requested property.'
          : i % 3 === 1
          ? 'Closer to children\'s school - My kids attend a school near the requested property.'
          : 'Prefer the new compound amenities - The requested property has better facilities for my family.',
        status: i === 0 ? 'approved' : i === 1 ? 'pending' : i === 2 ? 'rejected' : 'pending',
        eligibilityCheck: {
          similarUnitAvailable: true,
          sameOrLowerRent,
          noLatePayments,
          allInstallmentsPaid,
          message: sameOrLowerRent && noLatePayments && allInstallmentsPaid
            ? 'All eligibility criteria met. Transfer can be approved.'
            : 'Some criteria not met.',
        },
        paymentHistory,
        ...(i === 0 && {
          approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          adminNotes: 'Transfer approved - all conditions met, good payment history.',
        }),
        ...(i === 2 && {
          rejectionReason: 'Requested property has higher rent than current property.',
          adminNotes: 'Transfer rejected - does not meet rent criteria.',
        }),
      };

      transfers.push(transfer);
    }

    const created = await this.transferModel.insertMany(transfers);
    console.log(`✅ ${created.length} property transfer requests seeded successfully`);
    console.log(`   - ${transfers.filter(t => t.status === 'pending').length} pending`);
    console.log(`   - ${transfers.filter(t => t.status === 'approved').length} approved`);
    console.log(`   - ${transfers.filter(t => t.status === 'rejected').length} rejected`);
  }
}
