import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreatePropertyTransferDto } from './dto/create-property-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Bookings')
@Controller('user/bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user bookings' })
  @ApiResponse({ status: 200, description: 'Returns list of user bookings' })
  async getUserBookings(@Request() req: any) {
    return this.bookingsService.getUserBookings(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Returns booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBookingById(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.getBookingById(id, req.user.userId);
  }

  @Get('check/:propertyId')
  @ApiOperation({ summary: 'Check if user has an active booking for a property' })
  @ApiResponse({ status: 200, description: 'Returns existing booking or null' })
  async checkExistingBooking(
    @Param('propertyId') propertyId: string,
    @Request() req: any,
  ) {
    console.log('Checking existing booking for:', {
      userId: req.user.userId,
      propertyId,
    });

    const existingBooking = await this.bookingsService.checkExistingBooking(
      req.user.userId,
      propertyId,
    );

    console.log('Existing booking result:', {
      hasBooking: !!existingBooking,
      booking: existingBooking,
    });

    return { hasBooking: !!existingBooking, booking: existingBooking };
  }

  @Get('transfers/list')
  @ApiOperation({ summary: 'Get all user transfer requests' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of transfer requests',
  })
  async getUserTransferRequests(@Request() req: any) {
    return this.bookingsService.getUserTransferRequests(req.user.userId);
  }

  @Post('transfers/booking/create')
  @ApiOperation({ summary: 'Create a booking transfer request (transfer to new tenant)' })
  @ApiResponse({
    status: 201,
    description: 'Booking transfer request created successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async createTransferRequest(
    @Request() req: any,
    @Body() createTransferDto: CreateTransferDto,
  ) {
    return this.bookingsService.createTransferRequest(
      req.user.userId,
      createTransferDto,
    );
  }

  @Post('transfers/property/create')
  @ApiOperation({ summary: 'Create a property transfer request (move to different property)' })
  @ApiResponse({
    status: 201,
    description: 'Property transfer request created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data or no active contract' })
  @ApiResponse({ status: 404, description: 'Requested property not found' })
  async createPropertyTransferRequest(
    @Request() req: any,
    @Body() createPropertyTransferDto: CreatePropertyTransferDto,
  ) {
    return this.bookingsService.createPropertyTransferRequest(
      req.user.userId,
      createPropertyTransferDto,
    );
  }
}
