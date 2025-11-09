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
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAppliancesService } from './admin-appliances.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin/appliances')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAppliancesController {
  constructor(
    private readonly adminAppliancesService: AdminAppliancesService,
  ) {}

  // ========== إدارة الأجهزة (Appliances Management) ==========

  @Get()
  async findAllAppliances(@Query() filters: any) {
    // Filter by: type, status, price range
    // Returns: all appliances with rental stats
    return this.adminAppliancesService.findAllAppliances(filters);
  }

  @Get('stats')
  async getAppliancesStats() {
    // Get dashboard stats for appliances
    return this.adminAppliancesService.getAppliancesStats();
  }

  @Get(':id')
  async getApplianceDetails(@Param('id') id: string) {
    // Get appliance with rental history
    // Include: current rental, stats, maintenance history
    return this.adminAppliancesService.getApplianceDetails(id);
  }

  @Post()
  async createAppliance(@Body() createDto: any, @Request() req: any) {
    // Admin creates new appliance
    // Upload images, set prices and availability
    return this.adminAppliancesService.createAppliance(createDto, req.user.sub);
  }

  @Put(':id')
  async updateAppliance(@Param('id') id: string, @Body() updateDto: any) {
    // Update appliance info
    // Can change: prices, status, specifications
    return this.adminAppliancesService.updateAppliance(id, updateDto);
  }

  @Delete(':id')
  async deleteAppliance(@Param('id') id: string) {
    // Soft delete appliance
    // Check if currently rented
    return this.adminAppliancesService.deleteAppliance(id);
  }

  @Put(':id/maintenance')
  async setMaintenance(
    @Param('id') id: string,
    @Body() maintenanceDto: any,
    @Request() req: any,
  ) {
    // Set appliance to maintenance mode
    // Record maintenance date and notes
    return this.adminAppliancesService.setMaintenance(id, maintenanceDto, req.user.sub);
  }

  @Get(':id/rental-history')
  async getRentalHistory(@Param('id') id: string, @Query() query: any) {
    // Get all rental records for this appliance
    return this.adminAppliancesService.getRentalHistory(id, query);
  }

  // ========== طلبات التأجير (Rental Requests) ==========

  @Get('rental-requests/all')
  async getRentalRequests(@Query() filters: any) {
    // Filter by: status, appliance type, user
    // Returns: all rental requests with installments info
    return this.adminAppliancesService.getRentalRequests(filters);
  }

  @Get('rental-requests/:id')
  async getRentalRequest(@Param('id') id: string) {
    // Get rental request details with full installments table
    return this.adminAppliancesService.getRentalRequest(id);
  }

  @Put('rental-requests/:id/approve')
  async approveRental(
    @Param('id') id: string,
    @Body() approvalDto: any,
    @CurrentUser() user: any,
  ) {
    // Approve rental request
    // Generate installment schedule
    // Update appliance status to 'rented'
    // Send notification to user
    return this.adminAppliancesService.approveRental(id, approvalDto, user.sub);
  }

  @Put('rental-requests/:id/reject')
  async rejectRental(
    @Param('id') id: string,
    @Body() rejectionDto: any,
    @CurrentUser() user: any,
  ) {
    // Reject rental with reason
    // Return appliance to 'available' status
    return this.adminAppliancesService.rejectRental(id, rejectionDto, user.sub);
  }

  // ========== إدارة أقساط الأجهزة (Installments Management) ==========

  @Get('rental-requests/:id/installments')
  async getInstallments(@Param('id') id: string) {
    // Get all installments for a rental
    return this.adminAppliancesService.getInstallments(id);
  }

  @Put('rental-requests/:rentalId/installments/:installmentNumber')
  async updateInstallment(
    @Param('rentalId') rentalId: string,
    @Param('installmentNumber') installmentNumber: number,
    @Body() updateDto: any,
    @CurrentUser() user: any,
  ) {
    // Update installment: change payment method (card/cash), mark as paid
    return this.adminAppliancesService.updateInstallment(
      rentalId,
      Number(installmentNumber),
      updateDto,
      user.sub,
    );
  }

  @Put('rental-requests/:rentalId/installments/:installmentNumber/mark-paid')
  async markInstallmentPaid(
    @Param('rentalId') rentalId: string,
    @Param('installmentNumber') installmentNumber: number,
    @Body() paymentData: any,
    @CurrentUser() user: any,
  ) {
    // Mark installment as paid
    // If last installment: update appliance status back to 'available'
    // Update commitment reward
    return this.adminAppliancesService.markInstallmentPaid(
      rentalId,
      Number(installmentNumber),
      paymentData,
      user.sub,
    );
  }
}
