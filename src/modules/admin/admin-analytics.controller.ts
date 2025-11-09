import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('properties')
  async getPropertiesAnalytics(@Query() filters: any) {
    return this.analyticsService.getPropertiesAnalytics(filters);
  }

  @Get('users')
  async getUsersAnalytics(@Query() filters: any) {
    return this.analyticsService.getUsersAnalytics(filters);
  }

  @Get('revenue')
  async getRevenueAnalytics(@Query() filters: any) {
    return this.analyticsService.getRevenueAnalytics(filters);
  }

  @Get('recent-activity')
  async getRecentActivity(@Query('limit') limit: number = 20) {
    return this.analyticsService.getRecentActivity(limit);
  }
}
