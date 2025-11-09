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
  Req,
} from '@nestjs/common';
import { AdminPropertiesService } from './admin-properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { ApprovePropertyDto } from './dto/approve-property.dto';
import { RejectPropertyDto } from './dto/reject-property.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { FilterTransfersDto } from './dto/filter-transfers.dto';
import { UpdateInstallmentDto, MarkInstallmentPaidDto } from './dto/update-installment.dto';

@Controller('admin/properties')
@UseGuards(JwtAuthGuard)
export class AdminPropertiesController {
  constructor(private readonly propertiesService: AdminPropertiesService) {}

  // ========== PROPERTIES MANAGEMENT ==========

  @Get()
  async findAll(@Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findAllProperties(filters);
  }

  @Get('pending')
  async findPending() {
    return this.propertiesService.findPendingProperties();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findPropertyById(id);
  }

  @Put(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approvalDto: ApprovePropertyDto,
    @Req() req: any
  ) {
    return this.propertiesService.approveProperty(id, approvalDto, req.user.sub);
  }

  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() rejectionDto: RejectPropertyDto,
    @Req() req: any
  ) {
    return this.propertiesService.rejectProperty(id, rejectionDto, req.user.sub);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.propertiesService.updateProperty(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.propertiesService.deleteProperty(id);
  }

  // ========== BOOKING REQUESTS MANAGEMENT ==========

  @Get('bookings/all')
  async findAllBookings(@Query() filters: FilterBookingsDto) {
    return this.propertiesService.findAllBookings(filters);
  }

  @Get('bookings/:id')
  async findBooking(@Param('id') id: string) {
    return this.propertiesService.findBookingById(id);
  }

  @Put('bookings/:id/approve')
  async approveBooking(@Param('id') id: string, @Req() req: any) {
    return this.propertiesService.approveBooking(id, req.user.sub);
  }

  @Put('bookings/:id/reject')
  async rejectBooking(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any
  ) {
    return this.propertiesService.rejectBooking(id, reason, req.user.sub);
  }

  // ========== INSTALLMENTS MANAGEMENT ==========

  @Get('installments/all')
  async getAllInstallments(@Query() filters: any) {
    return this.propertiesService.getAllInstallments(filters);
  }

  @Put('bookings/:bookingId/installments/:installmentNumber')
  async updateInstallment(
    @Param('bookingId') bookingId: string,
    @Param('installmentNumber') installmentNumber: string,
    @Body() updateDto: UpdateInstallmentDto
  ) {
    return this.propertiesService.updateInstallment(
      bookingId,
      parseInt(installmentNumber),
      updateDto
    );
  }

  @Put('bookings/:bookingId/installments/:installmentNumber/mark-paid')
  async markInstallmentPaid(
    @Param('bookingId') bookingId: string,
    @Param('installmentNumber') installmentNumber: string,
    @Body() paymentData: MarkInstallmentPaidDto
  ) {
    return this.propertiesService.markInstallmentPaid(
      bookingId,
      parseInt(installmentNumber),
      paymentData
    );
  }

  // ========== TRANSFER REQUESTS MANAGEMENT ==========

  @Get('transfers/all')
  async findAllTransfers(@Query() filters: FilterTransfersDto) {
    return this.propertiesService.findAllTransfers(filters);
  }

  @Get('transfers/:id')
  async findTransfer(@Param('id') id: string) {
    return this.propertiesService.findTransferById(id);
  }

  @Put('transfers/:id/approve')
  async approveTransfer(@Param('id') id: string, @Req() req: any) {
    return this.propertiesService.approveTransfer(id, req.user.sub);
  }

  @Put('transfers/:id/reject')
  async rejectTransfer(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any
  ) {
    return this.propertiesService.rejectTransfer(id, reason, req.user.sub);
  }

  @Put('transfers/:id/request-info')
  async requestMoreInfo(
    @Param('id') id: string,
    @Body('message') message: string,
    @Req() req: any
  ) {
    return this.propertiesService.requestMoreInfo(id, message, req.user.sub);
  }
}
