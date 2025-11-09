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
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Request() req: any, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.userId, createAppointmentDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('appointmentType') appointmentType?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findByUser(req.user.userId, {
      appointmentType,
      status,
    });
  }

  @Get('upcoming')
  getUpcoming(@Request() req: any, @Query('limit') limit?: number) {
    return this.appointmentsService.getUpcoming(req.user.userId, limit);
  }

  @Get('past')
  getPast(@Request() req: any, @Query('limit') limit?: number) {
    return this.appointmentsService.getPast(req.user.userId, limit);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.appointmentsService.getStats(req.user.userId);
  }

  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.appointmentsService.findByProperty(propertyId);
  }

  @Get('property/:propertyId/booked-slots')
  getBookedTimeSlots(
    @Param('propertyId') propertyId: string,
    @Query('date') date: string,
  ) {
    const appointmentDate = new Date(date);
    return this.appointmentsService.getBookedTimeSlots(propertyId, appointmentDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Put(':id/assign-agent')
  assignAgent(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.appointmentsService.assignAgent(id, agentId);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.appointmentsService.cancel(id, reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
