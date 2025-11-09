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
import { AppliancesService } from './appliances.service';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { UpdateApplianceDto } from './dto/update-appliance.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryAppliancesDto } from './dto/query-appliances.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appliances')
export class AppliancesController {
  constructor(private readonly appliancesService: AppliancesService) {}

  // Public endpoints

  @Get()
  async findAll(@Query() query: QueryAppliancesDto) {
    return this.appliancesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appliancesService.findOne(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementViewCount(@Param('id') id: string) {
    await this.appliancesService.incrementViewCount(id);
  }

  // Protected endpoints (require authentication)

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createApplianceDto: CreateApplianceDto) {
    return this.appliancesService.create(createApplianceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApplianceDto: UpdateApplianceDto,
  ) {
    return this.appliancesService.update(id, updateApplianceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.appliancesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  async bookAppliance(
    @Param('id') id: string,
    @Request() req: any,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.appliancesService.bookAppliance(
      id,
      req.user.userId,
      createBookingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/my-bookings')
  async getUserBookings(@Request() req: any) {
    return this.appliancesService.getUserBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/:id')
  async getBookingById(@Param('id') id: string, @Request() req: any) {
    return this.appliancesService.getBookingById(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('bookings/:id/cancel')
  async cancelBooking(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason?: string,
  ) {
    return this.appliancesService.cancelBooking(id, req.user.userId, reason);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings/all')
  async getAllBookings(@Query() filters: any) {
    return this.appliancesService.getAllBookings(filters);
  }
}
