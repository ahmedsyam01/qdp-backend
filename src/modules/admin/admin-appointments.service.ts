import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
} from '../appointments/schemas/appointment.schema';

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async findAll(filters: any) {
    const {
      appointmentType,
      status,
      page = 1,
      limit = 20,
    } = filters;

    const query: any = {};

    if (appointmentType) {
      query.appointmentType = appointmentType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(query)
        .populate('userId', 'fullName phone email')
        .populate('propertyId', 'title location images')
        .populate('agentId', 'fullName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.appointmentModel.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('userId', 'fullName phone email identityNumber')
      .populate('propertyId')
      .populate('agentId', 'fullName phone email')
      .lean();

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getStats() {
    const [total, unconfirmed, confirmed, received, in_progress, agent] = await Promise.all([
      this.appointmentModel.countDocuments(),
      this.appointmentModel.countDocuments({ status: 'unconfirmed' }),
      this.appointmentModel.countDocuments({ status: 'confirmed' }),
      this.appointmentModel.countDocuments({ status: 'received' }),
      this.appointmentModel.countDocuments({ status: 'in_progress' }),
      this.appointmentModel.countDocuments({ status: 'agent' }),
    ]);

    // Get appointments by type
    const [viewing, delivery] = await Promise.all([
      this.appointmentModel.countDocuments({ appointmentType: 'viewing' }),
      this.appointmentModel.countDocuments({ appointmentType: 'delivery' }),
    ]);

    // Get recent appointments
    const recent = await this.appointmentModel
      .find()
      .populate('userId', 'fullName phone')
      .populate('propertyId', 'title location')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get upcoming appointments (confirmed and in the future)
    const upcoming = await this.appointmentModel
      .find({
        status: 'confirmed',
        date: { $gte: new Date() },
      })
      .populate('userId', 'fullName phone')
      .populate('propertyId', 'title location')
      .populate('agentId', 'fullName')
      .sort({ date: 1 })
      .limit(10)
      .lean();

    return {
      total,
      byStatus: {
        unconfirmed,
        confirmed,
        received,
        in_progress,
        agent,
      },
      byType: {
        viewing,
        delivery,
      },
      recent,
      upcoming,
    };
  }

  async updateStatus(id: string, status: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async assignAgent(id: string, agentId: string) {
    const appointment = await this.appointmentModel.findByIdAndUpdate(
      id,
      { agentId },
      { new: true },
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async remove(id: string) {
    const result = await this.appointmentModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Appointment not found');
    }

    return { message: 'Appointment deleted successfully' };
  }
}
