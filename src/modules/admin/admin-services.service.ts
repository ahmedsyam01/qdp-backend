import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { Technician, TechnicianDocument } from '../technicians/schemas/technician.schema';

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Technician.name) private technicianModel: Model<TechnicianDocument>,
  ) {}

  async findAll(filters: any) {
    const {
      serviceType,
      status,
      technicianId,
      page = 1,
      limit = 20,
    } = filters;

    const query: any = {};
    if (serviceType) query.serviceType = serviceType;
    if (status) query.status = status;
    if (technicianId) query.technicianId = technicianId;

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      this.serviceModel
        .find(query)
        .populate('userId', 'fullName phone email')
        .populate('propertyId', 'title location')
        .populate('technicianId', 'nameAr nameEn phone specialization status')
        .sort({ requestDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.serviceModel.countDocuments(query),
    ]);

    return {
      services,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const [
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      unassigned,
    ] = await Promise.all([
      this.serviceModel.countDocuments(),
      this.serviceModel.countDocuments({ status: 'pending' }),
      this.serviceModel.countDocuments({ status: 'in_progress' }),
      this.serviceModel.countDocuments({ status: 'completed' }),
      this.serviceModel.countDocuments({ status: 'cancelled' }),
      this.serviceModel.countDocuments({ technicianId: null }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      unassigned,
    };
  }

  async findOne(id: string) {
    const service = await this.serviceModel
      .findById(id)
      .populate('userId', 'fullName phone email')
      .populate('propertyId', 'title location')
      .populate('technicianId', 'nameAr nameEn phone specialization status averageRating')
      .exec();

    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    return service;
  }

  async assignTechnician(
    serviceId: string,
    technicianId: string,
    scheduledDate?: Date,
    notes?: string,
  ) {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    const technician = await this.technicianModel.findById(technicianId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    // Update technician's current jobs count
    if (!service.technicianId) {
      await this.technicianModel.findByIdAndUpdate(technicianId, {
        $inc: { currentJobs: 1, totalJobs: 1 },
      });
    }

    service.technicianId = technician._id as any;
    service.technicianName = technician.nameAr;
    if (scheduledDate) service.scheduledDate = scheduledDate;
    service.status = 'in_progress';

    await service.save();

    return this.findOne(serviceId);
  }

  async changeTechnician(serviceId: string, newTechnicianId: string, reason?: string) {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    const newTechnician = await this.technicianModel.findById(newTechnicianId);
    if (!newTechnician) {
      throw new NotFoundException('New technician not found');
    }

    // Decrease old technician's current jobs
    if (service.technicianId) {
      await this.technicianModel.findByIdAndUpdate(service.technicianId, {
        $inc: { currentJobs: -1 },
      });
    }

    // Increase new technician's current jobs
    await this.technicianModel.findByIdAndUpdate(newTechnicianId, {
      $inc: { currentJobs: 1, totalJobs: 1 },
    });

    service.technicianId = newTechnician._id as any;
    service.technicianName = newTechnician.nameAr;
    await service.save();

    return this.findOne(serviceId);
  }

  async updateStatus(serviceId: string, status: string, notes?: string) {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    const oldStatus = service.status;
    service.status = status;

    // If completing, update technician stats
    if (status === 'completed' && oldStatus !== 'completed' && service.technicianId) {
      service.completionDate = new Date();
      await this.technicianModel.findByIdAndUpdate(service.technicianId, {
        $inc: { currentJobs: -1, completedJobs: 1 },
      });
    }

    // If cancelling, decrease technician's current jobs
    if (status === 'cancelled' && oldStatus === 'in_progress' && service.technicianId) {
      await this.technicianModel.findByIdAndUpdate(service.technicianId, {
        $inc: { currentJobs: -1 },
      });
    }

    await service.save();
    return this.findOne(serviceId);
  }

  async updateCost(serviceId: string, estimatedCost: number, notes?: string) {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    service.estimatedCost = estimatedCost;
    await service.save();

    return this.findOne(serviceId);
  }

  async completeService(serviceId: string, finalCost: number, notes?: string) {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service request not found');
    }

    service.status = 'completed';
    service.cost = finalCost;
    service.completionDate = new Date();

    if (service.technicianId) {
      await this.technicianModel.findByIdAndUpdate(service.technicianId, {
        $inc: { currentJobs: -1, completedJobs: 1 },
      });
    }

    await service.save();
    return this.findOne(serviceId);
  }
}
