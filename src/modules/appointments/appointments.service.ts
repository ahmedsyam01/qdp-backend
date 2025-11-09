import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Check for existing appointment conflicts
    const existingAppointment = await this.appointmentModel.findOne({
      propertyId: new Types.ObjectId(createAppointmentDto.propertyId),
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status: { $in: ['unconfirmed', 'confirmed', 'in_progress', 'agent', 'received'] },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'هذا الموعد محجوز بالفعل. يرجى اختيار تاريخ أو وقت آخر.'
      );
    }

    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      userId: new Types.ObjectId(userId),
      propertyId: new Types.ObjectId(createAppointmentDto.propertyId),
      agentId: createAppointmentDto.agentId
        ? new Types.ObjectId(createAppointmentDto.agentId)
        : undefined,
      status: createAppointmentDto.status || 'unconfirmed',
    });

    return appointment.save();
  }

  async findByUser(
    userId: string,
    filters?: {
      appointmentType?: string;
      status?: string;
    },
  ): Promise<Appointment[]> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (filters?.appointmentType) {
      query.appointmentType = filters.appointmentType;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    return this.appointmentModel
      .find(query)
      .populate('propertyId', 'title titleAr images location price category propertyType')
      .populate('agentId', 'fullName phone email profilePicture')
      .populate('userId', 'fullName phone email')
      .sort({ date: -1 })
      .exec();
  }

  async findById(id: string): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentModel
      .findById(id)
      .populate('propertyId')
      .populate('agentId', 'fullName phone email profilePicture')
      .populate('userId', 'fullName phone email')
      .exec();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .populate('propertyId')
      .populate('agentId', 'fullName phone email profilePicture')
      .exec();

    if (!updatedAppointment) {
      throw new NotFoundException('Appointment not found');
    }

    return updatedAppointment;
  }

  async updateStatus(id: string, status: string): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const validStatuses = ['confirmed', 'received', 'in_progress', 'agent', 'unconfirmed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const update: any = { status };

    // Auto-set completedAt when status is 'received'
    if (status === 'received') {
      update.completedAt = new Date();
    }

    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      update,
      { new: true },
    ).populate('propertyId').populate('agentId', 'fullName phone email profilePicture');

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async cancel(id: string, reason?: string): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        status: 'unconfirmed',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      { new: true },
    ).populate('propertyId').populate('agentId', 'fullName phone email profilePicture');

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getUpcoming(userId: string, limit: number = 5): Promise<Appointment[]> {
    const now = new Date();
    return this.appointmentModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: now },
        status: { $in: ['confirmed', 'in_progress', 'agent'] },
      })
      .populate('propertyId', 'title titleAr images location price')
      .populate('agentId', 'fullName phone email profilePicture')
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  async getPast(userId: string, limit: number = 20): Promise<Appointment[]> {
    const now = new Date();
    return this.appointmentModel
      .find({
        userId: new Types.ObjectId(userId),
        $or: [
          { date: { $lt: now } },
          { status: { $in: ['received', 'unconfirmed'] } },
        ],
      })
      .populate('propertyId', 'title titleAr images location price')
      .populate('agentId', 'fullName phone email profilePicture')
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  async assignAgent(id: string, agentId: string): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(agentId)) {
      throw new BadRequestException('Invalid appointment or agent ID');
    }

    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      {
        agentId: new Types.ObjectId(agentId),
        status: 'agent',
      },
      { new: true },
    ).populate('propertyId').populate('agentId', 'fullName phone email profilePicture');

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid appointment ID');
    }

    const result = await this.appointmentModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Appointment not found');
    }
  }

  // Get appointments by property (for property owners)
  async findByProperty(propertyId: string): Promise<Appointment[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestException('Invalid property ID');
    }

    return this.appointmentModel
      .find({ propertyId: new Types.ObjectId(propertyId) })
      .populate('userId', 'fullName phone email')
      .populate('agentId', 'fullName phone email profilePicture')
      .sort({ date: -1 })
      .exec();
  }

  // Get statistics for dashboard
  async getStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    const [total, upcoming, completed, cancelled] = await Promise.all([
      this.appointmentModel.countDocuments({ userId: userObjectId }),
      this.appointmentModel.countDocuments({
        userId: userObjectId,
        date: { $gte: now },
        status: { $in: ['confirmed', 'in_progress', 'agent'] },
      }),
      this.appointmentModel.countDocuments({
        userId: userObjectId,
        status: 'received',
      }),
      this.appointmentModel.countDocuments({
        userId: userObjectId,
        status: 'unconfirmed',
        cancelledAt: { $exists: true },
      }),
    ]);

    return {
      total,
      upcoming,
      completed,
      cancelled,
    };
  }

  // Get booked time slots for a property on a specific date
  async getBookedTimeSlots(propertyId: string, date: Date): Promise<string[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestException('Invalid property ID');
    }

    const appointments = await this.appointmentModel.find({
      propertyId: new Types.ObjectId(propertyId),
      date: date,
      status: { $in: ['unconfirmed', 'confirmed', 'in_progress', 'agent', 'received'] },
    }).select('time');

    return appointments.map(apt => apt.time);
  }
}
