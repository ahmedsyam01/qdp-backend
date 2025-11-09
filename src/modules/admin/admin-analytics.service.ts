import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Parallel queries for better performance
    const [
      totalUsers,
      activeProperties,
      pendingAppointments,
      revenueThisMonth,
      newUsersThisWeek,
      propertiesByLocation,
      revenueByMonth,
      appointmentsToday,
      totalContracts,
      activeContracts,
      totalPayments,
    ] = await Promise.all([
      // Total users
      this.userModel.countDocuments(),

      // Active properties
      this.propertyModel.countDocuments({ status: 'active' }),

      // Pending appointments
      this.appointmentModel.countDocuments({ status: 'pending' }),

      // Revenue this month
      this.paymentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),

      // New users this week
      this.userModel.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),

      // Properties by location
      this.propertyModel.aggregate([
        {
          $match: { status: 'active' },
        },
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]),

      // Revenue by month (last 12 months)
      this.getRevenueByMonths(12),

      // Appointments today
      this.appointmentModel.find({
        appointmentDate: {
          $gte: startOfToday,
          $lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
        },
      })
        .populate('userId', 'fullName phone')
        .populate('propertyId', 'title location')
        .limit(10)
        .lean(),

      // Total contracts
      this.contractModel.countDocuments(),

      // Active contracts
      this.contractModel.countDocuments({ status: 'active' }),

      // Total payments
      this.paymentModel.countDocuments({ status: 'completed' }),
    ]);

    return {
      overview: {
        totalUsers,
        activeProperties,
        pendingAppointments,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        newUsersThisWeek,
        totalContracts,
        activeContracts,
        totalPayments,
      },
      charts: {
        propertiesByLocation: propertiesByLocation.map(item => ({
          location: item._id || 'Unknown',
          count: item.count,
        })),
        revenueByMonth,
      },
      appointmentsToday,
    };
  }

  async getPropertiesAnalytics(filters: any) {
    const query: any = {};

    // Apply filters if provided
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const [
      propertiesByType,
      propertiesByStatus,
      propertiesByPriceRange,
      topViewedProperties,
      averagePrice,
    ] = await Promise.all([
      // Properties by type
      this.propertyModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$propertyType',
            count: { $sum: 1 },
          },
        },
      ]),

      // Properties by status
      this.propertyModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Properties by price range
      this.propertyModel.aggregate([
        { $match: query },
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 1000000, 3000000, 5000000, 10000000, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),

      // Top viewed properties
      this.propertyModel
        .find(query)
        .sort({ viewsCount: -1 })
        .limit(10)
        .populate('userId', 'fullName phone')
        .lean(),

      // Average price
      this.propertyModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            averagePrice: { $avg: '$price' },
          },
        },
      ]),
    ]);

    return {
      byType: propertiesByType,
      byStatus: propertiesByStatus,
      byPriceRange: propertiesByPriceRange,
      topViewed: topViewedProperties,
      averagePrice: averagePrice[0]?.averagePrice || 0,
    };
  }

  async getUsersAnalytics(filters: any) {
    const query: any = {};

    if (filters.userType) {
      query.userType = filters.userType;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    const [
      usersByType,
      usersByVerification,
      userRegistrationTrend,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      // Users by type
      this.userModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$userType',
            count: { $sum: 1 },
          },
        },
      ]),

      // Users by verification status
      this.userModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              phoneVerified: '$phoneVerified',
              emailVerified: '$emailVerified',
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // User registration trend (last 12 months)
      this.getUserRegistrationTrend(12),

      // Total users
      this.userModel.countDocuments(query),

      // Active users (have at least one property or appointment)
      this.userModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'properties',
            localField: '_id',
            foreignField: 'userId',
            as: 'properties',
          },
        },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'userId',
            as: 'appointments',
          },
        },
        {
          $match: {
            $or: [
              { 'properties.0': { $exists: true } },
              { 'appointments.0': { $exists: true } },
            ],
          },
        },
        {
          $count: 'activeUsers',
        },
      ]),
    ]);

    return {
      byType: usersByType,
      byVerification: usersByVerification,
      registrationTrend: userRegistrationTrend,
      totalUsers,
      activeUsers: activeUsers[0]?.activeUsers || 0,
    };
  }

  async getRevenueAnalytics(filters: any) {
    const query: any = { status: 'completed' };

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    if (filters.paymentType) {
      query.paymentType = filters.paymentType;
    }

    const [
      revenueByType,
      revenueByMethod,
      revenueByMonth,
      totalRevenue,
      totalTransactions,
      averageTransaction,
    ] = await Promise.all([
      // Revenue by payment type
      this.paymentModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentType',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue by payment method
      this.paymentModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue by month
      this.getRevenueByMonths(12),

      // Total revenue
      this.paymentModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),

      // Total transactions
      this.paymentModel.countDocuments(query),

      // Average transaction
      this.paymentModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            average: { $avg: '$amount' },
          },
        },
      ]),
    ]);

    return {
      byType: revenueByType,
      byMethod: revenueByMethod,
      byMonth: revenueByMonth,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTransactions,
      averageTransaction: averageTransaction[0]?.average || 0,
    };
  }

  async getRecentActivity(limit: number = 20) {
    // Get recent activities from multiple sources
    const [recentUsers, recentProperties, recentAppointments, recentPayments, recentContracts] =
      await Promise.all([
        // Recent user registrations
        this.userModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('fullName createdAt userType')
          .lean(),

        // Recent property listings
        this.propertyModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName')
          .select('title status createdAt userId')
          .lean(),

        // Recent appointments
        this.appointmentModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName')
          .populate('propertyId', 'title')
          .select('appointmentType status createdAt userId propertyId')
          .lean(),

        // Recent payments
        this.paymentModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName')
          .select('amount paymentType status createdAt userId')
          .lean(),

        // Recent contracts
        this.contractModel
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('tenantId', 'fullName')
          .populate('propertyId', 'title')
          .select('contractType status createdAt tenantId propertyId')
          .lean(),
      ]);

    // Combine and format activities
    const activities: any[] = [];

    recentUsers.forEach((user: any) => {
      activities.push({
        type: 'user_registration',
        icon: 'user-plus',
        message: `${user.fullName} registered as ${user.userType}`,
        timestamp: user.createdAt,
        userId: user._id,
      });
    });

    recentProperties.forEach((property: any) => {
      activities.push({
        type: 'property_listed',
        icon: 'home',
        message: `${property.userId?.fullName} listed "${property.title}"`,
        timestamp: property.createdAt,
        propertyId: property._id,
        status: property.status,
      });
    });

    recentAppointments.forEach((appointment: any) => {
      activities.push({
        type: 'appointment_booked',
        icon: 'calendar',
        message: `${appointment.userId?.fullName} booked ${appointment.appointmentType} for "${appointment.propertyId?.title}"`,
        timestamp: appointment.createdAt,
        appointmentId: appointment._id,
        status: appointment.status,
      });
    });

    recentPayments.forEach((payment: any) => {
      activities.push({
        type: 'payment_completed',
        icon: 'dollar-sign',
        message: `${payment.userId?.fullName} paid ${payment.amount} QR for ${payment.paymentType}`,
        timestamp: payment.createdAt,
        paymentId: payment._id,
        amount: payment.amount,
      });
    });

    recentContracts.forEach((contract: any) => {
      activities.push({
        type: 'contract_signed',
        icon: 'file-text',
        message: `${contract.tenantId?.fullName} signed ${contract.contractType} contract for "${contract.propertyId?.title}"`,
        timestamp: contract.createdAt,
        contractId: contract._id,
        status: contract.status,
      });
    });

    // Sort by timestamp and limit
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // Helper methods
  private async getRevenueByMonths(months: number) {
    const result = await this.paymentModel.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return result.map(item => ({
      year: item._id.year,
      month: item._id.month,
      monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('en', {
        month: 'short',
      }),
      total: item.total,
      count: item.count,
    }));
  }

  private async getUserRegistrationTrend(months: number) {
    const result = await this.userModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return result.map(item => ({
      year: item._id.year,
      month: item._id.month,
      monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('en', {
        month: 'short',
      }),
      count: item.count,
    }));
  }
}
