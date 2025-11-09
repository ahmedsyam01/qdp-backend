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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  /**
   * POST /api/promo-codes/validate
   * Validate promo code and calculate discount (Public)
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() validateDto: ValidatePromoCodeDto) {
    return this.promoCodesService.validateAndCalculateDiscount(validateDto);
  }

  /**
   * POST /api/promo-codes
   * Create new promo code (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  /**
   * GET /api/promo-codes
   * Get all promo codes (Admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() filters?: any) {
    return this.promoCodesService.findAll(filters);
  }

  /**
   * GET /api/promo-codes/:id
   * Get promo code by ID (Admin only)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.promoCodesService.findById(id);
  }

  /**
   * PUT /api/promo-codes/:id
   * Update promo code (Admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreatePromoCodeDto>) {
    return this.promoCodesService.update(id, updateDto);
  }

  /**
   * PUT /api/promo-codes/:id/deactivate
   * Deactivate promo code (Admin only)
   */
  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deactivate(@Param('id') id: string) {
    return this.promoCodesService.deactivate(id);
  }

  /**
   * PUT /api/promo-codes/:id/activate
   * Activate promo code (Admin only)
   */
  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  activate(@Param('id') id: string) {
    return this.promoCodesService.activate(id);
  }

  /**
   * DELETE /api/promo-codes/:id
   * Delete promo code (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.promoCodesService.delete(id);
  }
}
