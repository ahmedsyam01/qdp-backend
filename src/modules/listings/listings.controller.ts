import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { CalculateFeeDto } from './dto/calculate-fee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * POST /api/listings/calculate-fee
   * Calculate listing fee for given ad duration
   */
  @Post('calculate-fee')
  @HttpCode(HttpStatus.OK)
  calculateFee(@Body() calculateFeeDto: CalculateFeeDto) {
    return this.listingsService.calculateFee(calculateFeeDto);
  }

  /**
   * POST /api/listings
   * Create new property listing
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() createListingDto: CreateListingDto) {
    return this.listingsService.create(user.userId, createListingDto);
  }

  /**
   * GET /api/listings/my-listings
   * Get user's property listings
   */
  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  findMyListings(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.listingsService.findByUser(user.userId, status);
  }

  /**
   * GET /api/listings/active
   * Get all active listings (public)
   */
  @Get('active')
  findActive(@Query() filters?: any) {
    return this.listingsService.findActive(filters);
  }

  /**
   * GET /api/listings/:id
   * Get listing by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  /**
   * PUT /api/listings/:id/renew
   * Renew expired listing
   */
  @Put(':id/renew')
  @UseGuards(JwtAuthGuard)
  renew(@Param('id') id: string, @Body('adDuration') adDuration: string) {
    return this.listingsService.renew(id, adDuration);
  }

  /**
   * PUT /api/listings/:id/cancel
   * Cancel listing
   */
  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string) {
    return this.listingsService.cancel(id);
  }

  /**
   * PUT /api/listings/:id/increment-views
   * Increment view count
   */
  @Put(':id/increment-views')
  @HttpCode(HttpStatus.NO_CONTENT)
  incrementViews(@Param('id') id: string) {
    return this.listingsService.incrementViews(id);
  }

  /**
   * PUT /api/listings/:id/increment-contacts
   * Increment contact count
   */
  @Put(':id/increment-contacts')
  @HttpCode(HttpStatus.NO_CONTENT)
  incrementContacts(@Param('id') id: string) {
    return this.listingsService.incrementContacts(id);
  }
}
