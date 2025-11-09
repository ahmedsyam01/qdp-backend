import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { RateServiceDto } from './dto/rate-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  /**
   * Create a new service request
   */
  async create(userId: string, createDto: CreateServiceDto): Promise<ServiceDocument> {
    console.log('Creating service for userId:', userId);
    console.log('CreateDto includes scheduledDate:', createDto.scheduledDate);

    const serviceData: any = {
      ...createDto,
      userId: new Types.ObjectId(userId),
      requestDate: new Date(),
      status: 'pending',
    };

    // Convert scheduledDate string to Date if provided
    if (createDto.scheduledDate) {
      serviceData.scheduledDate = new Date(createDto.scheduledDate);
    }

    const service = new this.serviceModel(serviceData);

    const saved = await service.save();
    console.log('Service created with ID:', saved._id, 'for userId:', saved.userId, 'scheduledDate:', saved.scheduledDate);
    return saved;
  }

  /**
   * Find all services for a user with optional filters
   */
  async findByUser(userId: string, filters?: FilterServiceDto): Promise<ServiceDocument[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.serviceType) {
      query.serviceType = filters.serviceType;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }

    return this.serviceModel
      .find(query)
      .populate('propertyId', 'title description location images')
      .populate('technicianId', 'fullName phone email')
      .sort({ requestDate: -1 })
      .exec();
  }

  /**
   * Get current (ongoing) service requests
   */
  async findCurrent(userId: string): Promise<ServiceDocument[]> {
    console.log('Finding current services for userId:', userId);
    const services = await this.serviceModel
      .find({
        userId: new Types.ObjectId(userId),
        status: { $in: ['pending', 'in_progress'] },
      })
      .populate('propertyId', 'title description location images')
      .populate('technicianId', 'fullName phone email')
      .sort({ requestDate: -1 })
      .exec();
    console.log('Found services:', services.length);
    return services;
  }

  /**
   * Get previous (completed or cancelled) service requests
   */
  async findPrevious(userId: string): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({
        userId: new Types.ObjectId(userId),
        status: { $in: ['completed', 'cancelled'] },
      })
      .populate('propertyId', 'title description location images')
      .populate('technicianId', 'fullName phone email')
      .sort({ completionDate: -1 })
      .exec();
  }

  /**
   * Get all services (for technicians/admins)
   */
  async findAll(filters?: FilterServiceDto): Promise<ServiceDocument[]> {
    const query: any = {};

    if (filters?.serviceType) {
      query.serviceType = filters.serviceType;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.technicianId) {
      query.technicianId = new Types.ObjectId(filters.technicianId);
    }

    return this.serviceModel
      .find(query)
      .populate('userId', 'fullName phone email')
      .populate('propertyId', 'title description location')
      .populate('technicianId', 'fullName phone email')
      .sort({ requestDate: -1 })
      .exec();
  }

  /**
   * Get a single service by ID
   */
  async findById(id: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findById(id)
      .populate('userId', 'fullName phone email')
      .populate('propertyId', 'title description location images')
      .populate('technicianId', 'fullName phone email')
      .exec();

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    return service;
  }

  /**
   * Update a service request
   */
  async update(
    id: string,
    userId: string,
    updateDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id);

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    // Only the owner can update their service request
    if (service.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own service requests');
    }

    Object.assign(service, updateDto);

    // If status is being updated to completed, set completion date
    if (updateDto.status === 'completed' && service.status !== 'completed') {
      service.completionDate = new Date();
    }

    return service.save();
  }

  /**
   * Update service status
   */
  async updateStatus(id: string, status: string, data?: any): Promise<ServiceDocument> {
    const update: any = { status, ...data };

    if (status === 'completed') {
      update.completionDate = new Date();
    }

    if (status === 'in_progress' && data?.scheduledDate) {
      update.scheduledDate = data.scheduledDate;
    }

    const service = await this.serviceModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    return service;
  }

  /**
   * Assign a technician to a service request
   */
  async assignTechnician(
    id: string,
    technicianId: string,
    scheduledDate: Date,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      {
        technicianId: new Types.ObjectId(technicianId),
        scheduledDate,
        status: 'in_progress',
      },
      { new: true },
    );

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    return service;
  }

  /**
   * Add rating and feedback to a completed service
   */
  async addRating(
    id: string,
    userId: string,
    rateDto: RateServiceDto,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id);

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    if (service.userId.toString() !== userId) {
      throw new ForbiddenException('You can only rate your own service requests');
    }

    if (service.status !== 'completed') {
      throw new ForbiddenException('You can only rate completed services');
    }

    service.rating = rateDto.rating;
    if (rateDto.feedback) {
      service.feedback = rateDto.feedback;
    }

    return service.save();
  }

  /**
   * Delete a service request
   */
  async delete(id: string, userId: string): Promise<void> {
    const service = await this.serviceModel.findById(id);

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    if (service.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own service requests');
    }

    // Only allow deletion of pending requests
    if (service.status !== 'pending') {
      throw new ForbiddenException('You can only delete pending service requests');
    }

    await this.serviceModel.findByIdAndDelete(id);
  }

  /**
   * Get services by technician
   */
  async findByTechnician(technicianId: string): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({ technicianId: new Types.ObjectId(technicianId) })
      .populate('userId', 'fullName phone email')
      .populate('propertyId', 'title description location')
      .sort({ scheduledDate: -1 })
      .exec();
  }

  /**
   * Get service statistics
   */
  async getStats(userId?: string) {
    const matchStage: any = {};
    if (userId) {
      matchStage.userId = new Types.ObjectId(userId);
    }

    const stats = await this.serviceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const serviceTypeStats = await this.serviceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          avgCost: { $avg: '$cost' },
        },
      },
    ]);

    return {
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byServiceType: serviceTypeStats.reduce((acc, curr) => {
        acc[curr._id] = {
          count: curr.count,
          avgCost: curr.avgCost,
        };
        return acc;
      }, {}),
    };
  }
}
