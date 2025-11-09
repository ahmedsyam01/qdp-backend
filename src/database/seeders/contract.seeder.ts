import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contract } from '../../modules/contracts/schemas/contract.schema';
import { User } from '../../modules/users/schemas/user.schema';
import { Property } from '../../modules/properties/schemas/property.schema';
import {
  RENTAL_CONTRACT_TERMS_AR,
} from '../../modules/contracts/templates/rental-contract-ar';
import {
  SALE_CONTRACT_TERMS_AR,
} from '../../modules/contracts/templates/sale-contract-ar';

@Injectable()
export class ContractSeeder {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<Contract>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async seed() {
    const count = await this.contractModel.countDocuments();
    if (count > 0) {
      console.log('⏭️  Contracts already seeded');
      return;
    }

    console.log('🔄 Seeding contracts...');

    // Get users and properties
    const users = await this.userModel.find().exec();
    const properties = await this.propertyModel.find().limit(30).exec();

    if (users.length < 2 || properties.length === 0) {
      console.log(
        '⚠️  Not enough users or properties to seed contracts. Please seed users and properties first.',
      );
      return;
    }

    const contracts = [];

    // Helper function to get random date
    const getRandomDate = (daysOffset: number) => {
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      return date;
    };

    // Helper function to get random user (exclude the same user)
    const getRandomUsers = () => {
      const shuffled = [...users].sort(() => 0.5 - Math.random());
      return { landlord: shuffled[0], tenant: shuffled[1] };
    };

    // Create 20 rental contracts
    for (let i = 0; i < 20; i++) {
      const property = properties[i % properties.length];
      const { landlord, tenant } = getRandomUsers();

      const startDate = getRandomDate(-30 + i * 2); // Stagger start dates
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year lease

      const monthlyRent = 3000 + Math.floor(Math.random() * 5000); // 3000-8000 QAR
      const numberOfChecks = 12;
      const insuranceAmount = monthlyRent; // 1 month deposit

      const terms = RENTAL_CONTRACT_TERMS_AR({
        startDate: startDate.toLocaleDateString('ar-QA'),
        endDate: endDate.toLocaleDateString('ar-QA'),
        amount: monthlyRent,
        numberOfChecks,
        insuranceAmount,
      });

      // Randomly assign status
      const statuses = ['draft', 'pending_signature', 'active', 'active', 'active'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const contract: any = {
        propertyId: property._id,
        tenantId: tenant._id,
        landlordId: landlord._id,
        contractType: 'rent',
        startDate,
        endDate,
        amount: monthlyRent,
        advancePayment: monthlyRent,
        terms,
        numberOfChecks,
        checkSchedule: {
          frequency: 'monthly',
          count: numberOfChecks,
          firstCheckDate: startDate,
        },
        insuranceAmount,
        status,
        loyaltyBonus: Math.random() > 0.3, // 70% have loyalty bonus
        allowUnitTransfer: Math.random() > 0.5, // 50% allow unit transfer
      };

      // Add signatures if active
      if (status === 'active') {
        contract.electronicSignatureTenant = `signature-tenant-${i}`;
        contract.electronicSignatureLandlord = `signature-landlord-${i}`;
        contract.signedAtTenant = new Date(startDate.getTime() - 86400000); // 1 day before start
        contract.signedAtLandlord = new Date(startDate.getTime() - 86400000);
      } else if (status === 'pending_signature') {
        // Randomly sign by one party
        if (Math.random() > 0.5) {
          contract.electronicSignatureTenant = `signature-tenant-${i}`;
          contract.signedAtTenant = new Date();
        } else {
          contract.electronicSignatureLandlord = `signature-landlord-${i}`;
          contract.signedAtLandlord = new Date();
        }
      }

      contracts.push(contract);
    }

    // Create 10 sale contracts
    for (let i = 0; i < 10; i++) {
      const property = properties[(i + 20) % properties.length];
      const { landlord, tenant } = getRandomUsers();

      const purchaseDate = getRandomDate(-60 + i * 3);
      const salePrice = 500000 + Math.floor(Math.random() * 1000000); // 500k-1.5M QAR
      const insuranceAmount = salePrice * 0.1; // 10% earnest money

      const terms = SALE_CONTRACT_TERMS_AR({
        purchaseDate: purchaseDate.toLocaleDateString('ar-QA'),
        salePrice,
        insuranceAmount,
      });

      const statuses = ['draft', 'pending_signature', 'active', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const contract: any = {
        propertyId: property._id,
        tenantId: tenant._id, // Buyer
        landlordId: landlord._id, // Seller
        contractType: 'sale',
        startDate: purchaseDate,
        amount: salePrice,
        terms,
        insuranceAmount,
        status,
      };

      // Add signatures based on status
      if (status === 'active' || status === 'completed') {
        contract.electronicSignatureTenant = `signature-buyer-${i}`;
        contract.electronicSignatureLandlord = `signature-seller-${i}`;
        contract.signedAtTenant = new Date(purchaseDate.getTime() - 172800000); // 2 days before
        contract.signedAtLandlord = new Date(purchaseDate.getTime() - 172800000);
      } else if (status === 'pending_signature') {
        if (Math.random() > 0.5) {
          contract.electronicSignatureTenant = `signature-buyer-${i}`;
          contract.signedAtTenant = new Date();
        } else {
          contract.electronicSignatureLandlord = `signature-seller-${i}`;
          contract.signedAtLandlord = new Date();
        }
      }

      contracts.push(contract);
    }

    // Create 3 cancelled contracts
    for (let i = 0; i < 3; i++) {
      const property = properties[i % properties.length];
      const { landlord, tenant } = getRandomUsers();

      const startDate = getRandomDate(-90);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const monthlyRent = 3500 + Math.floor(Math.random() * 3000);

      const terms = RENTAL_CONTRACT_TERMS_AR({
        startDate: startDate.toLocaleDateString('ar-QA'),
        endDate: endDate.toLocaleDateString('ar-QA'),
        amount: monthlyRent,
        numberOfChecks: 12,
        insuranceAmount: monthlyRent,
      });

      contracts.push({
        propertyId: property._id,
        tenantId: tenant._id,
        landlordId: landlord._id,
        contractType: 'rent',
        startDate,
        endDate,
        amount: monthlyRent,
        terms,
        numberOfChecks: 12,
        insuranceAmount: monthlyRent,
        status: 'cancelled',
        electronicSignatureTenant: `signature-tenant-cancelled-${i}`,
        electronicSignatureLandlord: `signature-landlord-cancelled-${i}`,
        signedAtTenant: new Date(startDate.getTime() - 86400000),
        signedAtLandlord: new Date(startDate.getTime() - 86400000),
        cancellationReason:
          i === 0
            ? 'المستأجر وجد وحدة أفضل في موقع آخر'
            : i === 1
              ? 'المؤجر يحتاج العقار لاستخدام شخصي'
              : 'تم الاتفاق على إنهاء العقد بالتراضي',
        cancelledAt: getRandomDate(-30),
        cancelledBy: i % 2 === 0 ? tenant._id : landlord._id,
        cancellationApproved: true,
      });
    }

    // Create 2 contracts with pending cancellation request
    for (let i = 0; i < 2; i++) {
      const property = properties[(i + 5) % properties.length];
      const { landlord, tenant } = getRandomUsers();

      const startDate = getRandomDate(-45);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const monthlyRent = 4000;

      const terms = RENTAL_CONTRACT_TERMS_AR({
        startDate: startDate.toLocaleDateString('ar-QA'),
        endDate: endDate.toLocaleDateString('ar-QA'),
        amount: monthlyRent,
        numberOfChecks: 12,
        insuranceAmount: monthlyRent,
      });

      contracts.push({
        propertyId: property._id,
        tenantId: tenant._id,
        landlordId: landlord._id,
        contractType: 'rent',
        startDate,
        endDate,
        amount: monthlyRent,
        terms,
        numberOfChecks: 12,
        insuranceAmount: monthlyRent,
        status: 'active',
        electronicSignatureTenant: `signature-tenant-pending-cancel-${i}`,
        electronicSignatureLandlord: `signature-landlord-pending-cancel-${i}`,
        signedAtTenant: new Date(startDate.getTime() - 86400000),
        signedAtLandlord: new Date(startDate.getTime() - 86400000),
        cancellationReason: 'طلب إلغاء العقد بسبب ظروف طارئة',
        cancellationRequestedAt: getRandomDate(-5),
        cancelledBy: tenant._id,
        cancellationApproved: false,
      });
    }

    await this.contractModel.insertMany(contracts);

    console.log(
      `✅ Contracts seeded successfully (${contracts.length} contracts)`,
    );
    console.log(`   - ${contracts.filter((c) => c.contractType === 'rent').length} rental contracts`);
    console.log(`   - ${contracts.filter((c) => c.contractType === 'sale').length} sale contracts`);
    console.log(`   - ${contracts.filter((c) => c.status === 'active').length} active contracts`);
    console.log(`   - ${contracts.filter((c) => c.status === 'cancelled').length} cancelled contracts`);
    console.log(`   - ${contracts.filter((c) => c.cancellationRequestedAt && !c.cancellationApproved).length} pending cancellation requests`);
  }
}
