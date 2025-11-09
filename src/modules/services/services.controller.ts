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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilterServiceDto } from './dto/filter-service.dto';
import { RateServiceDto } from './dto/rate-service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Create a new service request
   * POST /api/services
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: any, @Body() createDto: CreateServiceDto) {
    return this.servicesService.create(req.user.userId, createDto);
  }

  /**
   * Get all service requests for the current user
   * GET /api/services
   */
  @Get()
  findAll(@Request() req: any, @Query() filters: FilterServiceDto) {
    return this.servicesService.findByUser(req.user.userId, filters);
  }

  /**
   * Get current (ongoing) service requests
   * GET /api/services/current
   */
  @Get('current')
  getCurrent(@Request() req: any) {
    return this.servicesService.findCurrent(req.user.userId);
  }

  /**
   * Get previous (completed/cancelled) service requests
   * GET /api/services/previous
   */
  @Get('previous')
  getPrevious(@Request() req: any) {
    return this.servicesService.findPrevious(req.user.userId);
  }

  /**
   * Get service statistics
   * GET /api/services/stats
   */
  @Get('stats')
  getStats(@Request() req: any) {
    return this.servicesService.getStats(req.user.userId);
  }

  /**
   * Get a specific service request by ID
   * GET /api/services/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  /**
   * Update a service request
   * PUT /api/services/:id
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user.userId, updateDto);
  }

  /**
   * Update service status
   * PUT /api/services/:id/status
   */
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body() data: any,
  ) {
    return this.servicesService.updateStatus(id, status, data);
  }

  /**
   * Assign a technician to a service request
   * PUT /api/services/:id/assign
   */
  @Put(':id/assign')
  assignTechnician(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
    @Body('scheduledDate') scheduledDate: Date,
  ) {
    return this.servicesService.assignTechnician(id, technicianId, scheduledDate);
  }

  /**
   * Rate a completed service
   * PUT /api/services/:id/rate
   */
  @Put(':id/rate')
  addRating(
    @Param('id') id: string,
    @Request() req: any,
    @Body() rateDto: RateServiceDto,
  ) {
    return this.servicesService.addRating(id, req.user.userId, rateDto);
  }

  /**
   * Delete a service request
   * DELETE /api/services/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.servicesService.delete(id, req.user.userId);
  }
}
