import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminTechniciansService } from './admin-technicians.service';
import { CreateTechnicianDto } from '../technicians/dto/create-technician.dto';
import { UpdateTechnicianDto } from '../technicians/dto/update-technician.dto';
import { FilterTechniciansDto } from '../technicians/dto/filter-technicians.dto';

@Controller('admin/technicians')
@UseGuards(JwtAuthGuard)
export class AdminTechniciansController {
  constructor(
    private readonly adminTechniciansService: AdminTechniciansService,
  ) {}

  @Get()
  async findAllTechnicians(@Query() filters: FilterTechniciansDto) {
    return await this.adminTechniciansService.findAll(filters);
  }

  @Get('stats')
  async getTechniciansStats() {
    return await this.adminTechniciansService.getStats();
  }

  @Get('available/:specialization')
  async getAvailableTechnicians(@Param('specialization') specialization: string) {
    return await this.adminTechniciansService.getAvailableBySpecialization(
      specialization,
    );
  }

  @Get(':id')
  async getTechnicianDetails(@Param('id') id: string) {
    return await this.adminTechniciansService.findOneWithDetails(id);
  }

  @Get(':id/jobs')
  async getTechnicianJobs(@Param('id') id: string, @Query() filters: any) {
    return await this.adminTechniciansService.getTechnicianJobs(id, filters);
  }

  @Post()
  async createTechnician(@Body() createDto: CreateTechnicianDto) {
    return await this.adminTechniciansService.create(createDto);
  }

  @Put(':id')
  async updateTechnician(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnicianDto,
  ) {
    return await this.adminTechniciansService.update(id, updateDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.adminTechniciansService.updateStatus(id, status);
  }

  @Delete(':id')
  async deleteTechnician(@Param('id') id: string) {
    await this.adminTechniciansService.delete(id);
    return { message: 'Technician deleted successfully' };
  }
}
