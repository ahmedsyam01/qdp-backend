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
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { FilterTechniciansDto } from './dto/filter-technicians.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  async create(@Body() createDto: CreateTechnicianDto) {
    return await this.techniciansService.create(createDto);
  }

  @Get()
  async findAll(@Query() filters: FilterTechniciansDto) {
    return await this.techniciansService.findAll(filters);
  }

  @Get('stats')
  async getStats() {
    return await this.techniciansService.getStats();
  }

  @Get('by-specialization/:specialization')
  async findBySpecialization(
    @Param('specialization') specialization: string,
    @Query('limit') limit?: number,
  ) {
    return await this.techniciansService.findBySpecialization(
      specialization,
      limit,
    );
  }

  @Get('available/:specialization')
  async findAvailable(@Param('specialization') specialization: string) {
    return await this.techniciansService.findAvailableBySpecialization(
      specialization,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.techniciansService.findOne(id);
  }

  @Get(':id/jobs')
  async getTechnicianJobs(@Param('id') id: string) {
    return await this.techniciansService.getTechnicianJobs(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnicianDto,
  ) {
    return await this.techniciansService.update(id, updateDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.techniciansService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.techniciansService.delete(id);
    return { message: 'Technician deleted successfully' };
  }
}
