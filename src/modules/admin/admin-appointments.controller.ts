import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminAppointmentsService } from './admin-appointments.service';

@Controller('admin/appointments')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAppointmentsController {
  constructor(
    private readonly adminAppointmentsService: AdminAppointmentsService,
  ) {}

  @Get()
  async findAll(
    @Query('appointmentType') appointmentType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      appointmentType,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };
    return this.adminAppointmentsService.findAll(filters);
  }

  @Get('stats')
  async getStats() {
    return this.adminAppointmentsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminAppointmentsService.findOne(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminAppointmentsService.updateStatus(id, status);
  }

  @Put(':id/assign-agent')
  async assignAgent(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
  ) {
    return this.adminAppointmentsService.assignAgent(id, agentId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminAppointmentsService.remove(id);
  }
}
