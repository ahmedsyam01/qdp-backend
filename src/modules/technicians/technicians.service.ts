import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Technician,
  TechnicianDocument,
} from './schemas/technician.schema';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { FilterTechniciansDto } from './dto/filter-technicians.dto';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
  ) {}

  async create(createDto: CreateTechnicianDto): Promise<Technician> {
    // Check if phone already exists
    const existingTechnician = await this.technicianModel.findOne({
      phone: createDto.phone,
    });

    if (existingTechnician) {
      throw new ConflictException('Phone number already registered');
    }

    const technician = new this.technicianModel(createDto);
    return await technician.save();
  }

  async findAll(filters: FilterTechniciansDto) {
    const {
      specialization,
      status,
      search,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const query: any = {};

    if (specialization) {
      query.specialization = specialization;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { nameAr: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (minRating !== undefined) {
      query.averageRating = { $gte: minRating };
    }

    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    if (sortBy === 'rating') {
      sort.averageRating = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'jobs') {
      sort.completedJobs = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sort.nameEn = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const [technicians, total] = await Promise.all([
      this.technicianModel.find(query).sort(sort).skip(skip).limit(limit),
      this.technicianModel.countDocuments(query),
    ]);

    return {
      technicians,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Technician> {
    const technician = await this.technicianModel.findById(id);

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async findBySpecialization(
    specialization: string,
    limit: number = 10,
  ): Promise<Technician[]> {
    return await this.technicianModel
      .find({
        specialization,
        status: { $in: ['active', 'busy'] },
      })
      .sort({ averageRating: -1, currentJobs: 1 })
      .limit(limit);
  }

  async findAvailableBySpecialization(
    specialization: string,
  ): Promise<Technician[]> {
    return await this.technicianModel
      .find({
        specialization,
        status: 'active',
      })
      .sort({ currentJobs: 1, averageRating: -1 });
  }

  async update(
    id: string,
    updateDto: UpdateTechnicianDto,
  ): Promise<Technician> {
    // Check if updating phone and if it's already taken
    if (updateDto.phone) {
      const existingTechnician = await this.technicianModel.findOne({
        phone: updateDto.phone,
        _id: { $ne: id },
      });

      if (existingTechnician) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const technician = await this.technicianModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async updateStatus(id: string, status: string): Promise<Technician> {
    const technician = await this.technicianModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async incrementJobs(id: string): Promise<void> {
    await this.technicianModel.findByIdAndUpdate(id, {
      $inc: { totalJobs: 1, currentJobs: 1 },
      $set: { 'metadata.lastAssignedDate': new Date() },
    });
  }

  async decrementJobs(id: string, completed: boolean = false): Promise<void> {
    const update: any = {
      $inc: { currentJobs: -1 },
    };

    if (completed) {
      update.$inc.completedJobs = 1;
      update.$set = { 'metadata.lastCompletedDate': new Date() };
    }

    await this.technicianModel.findByIdAndUpdate(id, update);
  }

  async addRating(
    id: string,
    userId: string,
    serviceId: string,
    rating: number,
    comment: string,
  ): Promise<Technician> {
    const technicianDoc = await this.technicianModel.findById(id);

    if (!technicianDoc) {
      throw new NotFoundException('Technician not found');
    }

    // Add new rating
    technicianDoc.ratings.push({
      userId: userId as any,
      serviceId: serviceId as any,
      rating,
      comment,
      date: new Date(),
    });

    // Recalculate average rating
    const totalRatings = technicianDoc.ratings.length;
    const sumRatings = technicianDoc.ratings.reduce(
      (sum, r) => sum + r.rating,
      0,
    );
    technicianDoc.averageRating = parseFloat(
      (sumRatings / totalRatings).toFixed(2),
    );

    await technicianDoc.save();
    return technicianDoc;
  }

  async delete(id: string): Promise<void> {
    const result = await this.technicianModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Technician not found');
    }
  }

  async getStats() {
    const [total, active, inactive, busy, avgRating] = await Promise.all([
      this.technicianModel.countDocuments(),
      this.technicianModel.countDocuments({ status: 'active' }),
      this.technicianModel.countDocuments({ status: 'inactive' }),
      this.technicianModel.countDocuments({ status: 'busy' }),
      this.technicianModel.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$averageRating' },
          },
        },
      ]),
    ]);

    return {
      total,
      active,
      inactive,
      busy,
      averageRating: avgRating[0]?.avgRating || 0,
    };
  }

  async getTechnicianJobs(id: string) {
    // This will be populated from services module
    // For now, return the technician's job counts
    const technician = await this.findOne(id);
    return {
      totalJobs: technician.totalJobs,
      completedJobs: technician.completedJobs,
      currentJobs: technician.currentJobs,
      averageRating: technician.averageRating,
    };
  }
}
