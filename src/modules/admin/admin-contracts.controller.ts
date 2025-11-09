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
import { AdminContractsService } from './admin-contracts.service';

@Controller('admin/contracts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminContractsController {
  constructor(
    private readonly adminContractsService: AdminContractsService,
  ) {}

  @Get()
  async findAll(
    @Query('contractType') contractType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      contractType,
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };
    return this.adminContractsService.findAll(filters);
  }

  @Get('stats')
  async getStats() {
    return this.adminContractsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminContractsService.findOne(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminContractsService.updateStatus(id, status);
  }

  @Put(':id/approve-cancellation')
  async approveCancellation(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
  ) {
    return this.adminContractsService.approveCancellation(id, approved);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminContractsService.remove(id);
  }

  @Put(':id/sign-landlord')
  async signAsLandlord(
    @Param('id') id: string,
    @Body('signature') signature: string,
  ) {
    return this.adminContractsService.signAsLandlord(id, signature);
  }
}
