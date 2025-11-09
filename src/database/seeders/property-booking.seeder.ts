import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PropertyBooking,
  PropertyBookingDocument,
} from '../../modules/bookings/schemas/property-booking.schema';
import {
  Property,
  PropertyDocument,
} from '../../modules/properties/schemas/property.schema';
import {
  User,
  UserDocument,
} from '../../modules/users/schemas/user.schema';

@Injectable()
export class PropertyBookingSeeder {
  constructor(
    @InjectModel(PropertyBooking.name)
    private bookingModel: Model<PropertyBookingDocument>,
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async seed() {
    const count = await this.bookingModel.countDocuments();
    if (count > 0) {
      console.log('⚠️  Property bookings already exist. Skipping seed.');
      return;
    }

    // Get properties available for rent
    const rentProperties = await this.propertyModel
      .find({ 'availableFor.rent': true })
      .limit(10)
      .lean();

    // Get properties available for sale
    const saleProperties = await this.propertyModel
      .find({ 'availableFor.sale': true })
      .limit(5)
      .lean();

    // Get users (excluding admin users)
    const users = await this.userModel
      .find({ userType: { $in: ['buyer', 'seller'] } })
      .limit(5)
      .lean();

    if (rentProperties.length === 0 || users.length === 0) {
      console.log('⚠️  Not enough properties or users. Skipping booking seed.');
      return;
    }

    const bookings: any[] = [];

    // Create RENT bookings with installments
    for (let i = 0; i < Math.min(rentProperties.length, 8); i++) {
      const property: any = rentProperties[i];
      const user: any = users[i % users.length];

      const startDate = new Date();
      startDate.setDate(1); // Start of month
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 12); // 12 months later

      const monthlyAmount = property.availableFor.rentPrice || 5000;
      const numberOfInstallments = property.availableFor.numberOfInstallments || 12;
      const insuranceDeposit = property.availableFor.insuranceDeposit || monthlyAmount;

      // Generate installment schedule
      const installments = [];
      for (let j = 1; j <= numberOfInstallments; j++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + j - 1);

        // Simulate payment status
        let status: 'pending' | 'paid' | 'overdue' = 'pending';
        let paidAt: Date | undefined;
        let paidAmount: number | undefined;

        if (j <= 3) {
          // First 3 months paid
          status = 'paid';
          paidAt = new Date(dueDate);
          paidAt.setDate(dueDate.getDate() - Math.floor(Math.random() * 5)); // Paid few days early
          paidAmount = monthlyAmount;
        } else if (j === 4 && i % 3 === 0) {
          // 4th month overdue for some bookings
          status = 'overdue';
        }

        installments.push({
          installmentNumber: j,
          dueDate,
          amount: monthlyAmount,
          status,
          paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
          ...(paidAt && { paidAt }),
          ...(paidAmount && { paidAmount }),
        });
      }

      const booking = {
        propertyId: new Types.ObjectId(property._id),
        userId: new Types.ObjectId(user._id),
        bookingType: 'rent',
        totalAmount: monthlyAmount * numberOfInstallments,
        monthlyAmount,
        numberOfInstallments,
        insuranceDeposit,
        installments,
        status: i < 6 ? 'approved' : 'pending', // 6 approved, 2 pending
        startDate,
        endDate,
        userDetails: {
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          identityNumber: user.identityNumber || '28011111111',
          currentAddress: 'Doha, Qatar',
        },
        requestNotes: 'Looking for a nice place to stay for 12 months.',
        adminNotes: i < 6 ? 'Approved - good tenant history' : '',
        ...(i < 6 && {
          approvedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        }),
      };

      bookings.push(booking);
    }

    // Create SALE bookings (no installments)
    for (let i = 0; i < Math.min(saleProperties.length, 3); i++) {
      const property: any = saleProperties[i];
      const user: any = users[(i + 2) % users.length];

      const booking = {
        propertyId: new Types.ObjectId(property._id),
        userId: new Types.ObjectId(user._id),
        bookingType: 'sale',
        totalAmount: property.availableFor.salePrice || property.price,
        installments: [], // No installments for sale
        status: i === 0 ? 'approved' : 'pending',
        userDetails: {
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          identityNumber: user.identityNumber || '28011111111',
          currentAddress: 'Doha, Qatar',
        },
        requestNotes: 'Interested in purchasing this property.',
        adminNotes: i === 0 ? 'Approved - verified buyer' : '',
        ...(i === 0 && {
          approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }),
      };

      bookings.push(booking);
    }

    const created = await this.bookingModel.insertMany(bookings);
    console.log(`✅ ${created.length} property bookings seeded successfully`);
    console.log(`   - ${bookings.filter(b => b.bookingType === 'rent').length} rent bookings with installments`);
    console.log(`   - ${bookings.filter(b => b.bookingType === 'sale').length} sale bookings`);
  }
}
