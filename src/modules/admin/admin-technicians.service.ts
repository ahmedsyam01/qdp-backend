import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Technician,
  TechnicianDocument,
} from '../technicians/schemas/technician.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { CreateTechnicianDto } from '../technicians/dto/create-technician.dto';
import { UpdateTechnicianDto } from '../technicians/dto/update-technician.dto';
import { FilterTechniciansDto } from '../technicians/dto/filter-technicians.dto';
import { TechniciansService } from '../technicians/technicians.service';

@Injectable()
export class AdminTechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    private techniciansService: TechniciansService,
  ) {}

  async findAll(filters: FilterTechniciansDto) {
    return await this.techniciansService.findAll(filters);
  }

  async findOneWithDetails(id: string) {
    const technician = await this.techniciansService.findOne(id);

    // Get current jobs
    const currentJobs = await this.serviceModel
      .find({
        technicianId: id,
        status: { $in: ['pending', 'in_progress'] },
      })
      .populate('userId', 'fullName phone')
      .populate('propertyId', 'titleEn titleAr location')
      .limit(10);

    // Get completed jobs
    const completedJobs = await this.serviceModel
      .find({
        technicianId: id,
        status: 'completed',
      })
      .populate('userId', 'fullName phone')
      .populate('propertyId', 'titleEn titleAr location')
      .sort({ completionDate: -1 })
      .limit(10);

    return {
      ...technician,
      currentJobs,
      completedJobs,
    };
  }

  async getTechnicianJobs(id: string, filters: any) {
    const query: any = { technicianId: id };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      query.requestDate = {};
      if (filters.startDate) {
        query.requestDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.requestDate.$lte = new Date(filters.endDate);
      }
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.serviceModel
        .find(query)
        .populate('userId', 'fullName phone')
        .populate('propertyId', 'titleEn titleAr location')
        .sort({ requestDate: -1 })
        .skip(skip)
        .limit(limit),
      this.serviceModel.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createDto: CreateTechnicianDto) {
    return await this.techniciansService.create(createDto);
  }

  async update(id: string, updateDto: UpdateTechnicianDto) {
    return await this.techniciansService.update(id, updateDto);
  }

  async updateStatus(id: string, status: string) {
    return await this.techniciansService.updateStatus(id, status);
  }

  async delete(id: string) {
    // Check if technician has active jobs
    const activeJobs = await this.serviceModel.countDocuments({
      technicianId: id,
      status: { $in: ['pending', 'in_progress'] },
    });

    if (activeJobs > 0) {
      throw new Error(
        `Cannot delete technician with ${activeJobs} active job(s). Please reassign or complete them first.`,
      );
    }

    return await this.techniciansService.delete(id);
  }

  async getStats() {
    return await this.techniciansService.getStats();
  }

  async getAvailableBySpecialization(specialization: string) {
    return await this.techniciansService.findAvailableBySpecialization(
      specialization,
    );
  }
}
