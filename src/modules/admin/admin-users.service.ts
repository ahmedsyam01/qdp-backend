import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
  ) {}

  async findAll(filters: FilterUsersDto) {
    const {
      search,
      userType,
      status,
      startDate,
      endDate,
      verified,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build query
    const query: any = {};

    // Search across multiple fields
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { identityNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by user type
    if (userType) {
      query.userType = userType;
    }

    // Filter by status (this would require a status field in schema, or we can use a computed field)
    // For now, we'll use phoneVerified and emailVerified as indicators
    if (status === 'active') {
      query.phoneVerified = true;
    } else if (status === 'inactive') {
      query.phoneVerified = false;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Filter by verification status
    if (verified === 'true') {
      query.phoneVerified = true;
      query.emailVerified = true;
    } else if (verified === 'false') {
      query.$or = [{ phoneVerified: false }, { emailVerified: false }];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password -otp -otpExpiry')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password -otp -otpExpiry')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get related data
    const [properties, appointments, contracts] = await Promise.all([
      this.propertyModel.find({ owner: id }).countDocuments(),
      this.appointmentModel.find({ user: id }).countDocuments(),
      this.contractModel.find({ tenant: id }).countDocuments(),
    ]);

    return {
      ...user,
      stats: {
        properties,
        appointments,
        contracts,
      },
    };
  }

  async create(createUserDto: CreateUserAdminDto, adminId: string) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { phone: createUserDto.phone },
        { email: createUserDto.email },
        { identityNumber: createUserDto.identityNumber },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User with this phone, email, or identity number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      phoneVerified: true, // Admin-created users are pre-verified
      emailVerified: !!createUserDto.email,
    });

    await user.save();

    // Return user without password
    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async update(id: string, updateDto: UpdateUserAdminDto, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for duplicate phone or email if being updated
    if (updateDto.phone || updateDto.email) {
      const existingUser = await this.userModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateDto.phone ? [{ phone: updateDto.phone }] : []),
          ...(updateDto.email ? [{ email: updateDto.email }] : []),
        ],
      });

      if (existingUser) {
        throw new BadRequestException('Phone or email already in use');
      }
    }

    // Update user
    Object.assign(user, updateDto);
    await user.save();

    // Return updated user without sensitive data
    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async updateStatus(id: string, status: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Map status to verification fields (since we don't have a dedicated status field)
    switch (status) {
      case 'active':
        user.phoneVerified = true;
        user.emailVerified = true;
        break;
      case 'inactive':
        user.phoneVerified = false;
        break;
      case 'suspended':
        // This would require adding a suspended field to the schema
        // For now, we'll just mark as unverified
        user.phoneVerified = false;
        user.emailVerified = false;
        break;
      default:
        throw new BadRequestException('Invalid status');
    }

    await user.save();

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async softDelete(id: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by marking phone as deleted and unverified
    // This prevents the user from logging in
    user.phoneVerified = false;
    user.emailVerified = false;
    await user.save();

    return { message: 'User deactivated successfully' };
  }

  async getUserActivity(id: string, limit: number = 20) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get recent activities from various collections
    const [recentProperties, recentAppointments, recentContracts] = await Promise.all([
      this.propertyModel
        .find({ owner: id })
        .sort({ createdAt: -1 })
        .limit(limit / 3)
        .select('title status createdAt')
        .lean() as Promise<any[]>,
      this.appointmentModel
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(limit / 3)
        .populate('propertyId', 'title')
        .select('appointmentType status date createdAt')
        .lean() as Promise<any[]>,
      this.contractModel
        .find({ tenant: id })
        .sort({ createdAt: -1 })
        .limit(limit / 3)
        .populate('property', 'title')
        .select('contractType status startDate createdAt')
        .lean() as Promise<any[]>,
    ]);

    // Combine and sort activities
    const activities: any[] = [
      ...recentProperties.map((p: any) => ({
        type: 'property',
        action: 'Property listed',
        description: p.title,
        status: p.status,
        date: p.createdAt,
      })),
      ...recentAppointments.map((a: any) => ({
        type: 'appointment',
        action: 'Appointment booked',
        description: `${a.appointmentType} - ${a.propertyId?.title || 'N/A'}`,
        status: a.status,
        date: a.date || a.createdAt,
      })),
      ...recentContracts.map((c: any) => ({
        type: 'contract',
        action: 'Contract created',
        description: `${c.contractType} - ${c.property?.title || 'N/A'}`,
        status: c.status,
        date: c.startDate || c.createdAt,
      })),
    ];

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return activities.slice(0, limit);
  }

  async getUserStats(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      totalProperties,
      activeProperties,
      totalAppointments,
      completedAppointments,
      totalContracts,
      activeContracts,
    ] = await Promise.all([
      this.propertyModel.countDocuments({ owner: id }),
      this.propertyModel.countDocuments({ owner: id, status: 'active' }),
      this.appointmentModel.countDocuments({ user: id }),
      this.appointmentModel.countDocuments({ user: id, status: 'completed' }),
      this.contractModel.countDocuments({ tenant: id }),
      this.contractModel.countDocuments({ tenant: id, status: 'active' }),
    ]);

    return {
      properties: {
        total: totalProperties,
        active: activeProperties,
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
      },
    };
  }

  async verifyPhone(id: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.phoneVerified = true;
    await user.save();

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async unverifyPhone(id: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.phoneVerified = false;
    await user.save();

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async verifyEmail(id: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerified = true;
    await user.save();

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }

  async unverifyEmail(id: string, adminId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.emailVerified = false;
    await user.save();

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    return userObj;
  }
}
