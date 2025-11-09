import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminServicesService } from './admin-services.service';

@Controller('admin/services')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminServicesController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  @Get()
  async findAll(
    @Query('serviceType') serviceType?: string,
    @Query('status') status?: string,
    @Query('technicianId') technicianId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      serviceType,
      status,
      technicianId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };
    return this.adminServicesService.findAll(filters);
  }

  @Get('stats')
  async getStats() {
    return this.adminServicesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminServicesService.findOne(id);
  }

  @Put(':id/assign-technician')
  async assignTechnician(
    @Param('id') id: string,
    @Body() assignDto: { technicianId: string; scheduledDate?: Date; notes?: string },
  ) {
    return this.adminServicesService.assignTechnician(
      id,
      assignDto.technicianId,
      assignDto.scheduledDate,
      assignDto.notes,
    );
  }

  @Put(':id/change-technician')
  async changeTechnician(
    @Param('id') id: string,
    @Body() changeDto: { technicianId: string; reason?: string },
  ) {
    return this.adminServicesService.changeTechnician(
      id,
      changeDto.technicianId,
      changeDto.reason,
    );
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string; notes?: string },
  ) {
    return this.adminServicesService.updateStatus(id, statusDto.status, statusDto.notes);
  }

  @Put(':id/cost')
  async updateCost(
    @Param('id') id: string,
    @Body() costDto: { estimatedCost: number; notes?: string },
  ) {
    return this.adminServicesService.updateCost(id, costDto.estimatedCost, costDto.notes);
  }

  @Put(':id/complete')
  async completeService(
    @Param('id') id: string,
    @Body() completionDto: { finalCost: number; notes?: string },
  ) {
    return this.adminServicesService.completeService(
      id,
      completionDto.finalCost,
      completionDto.notes,
    );
  }
}
