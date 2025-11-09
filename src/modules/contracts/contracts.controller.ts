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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import {
  CancelContractDto,
  ApproveCancellationDto,
} from './dto/cancel-contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * Create a new contract (draft)
   * POST /api/contracts
   */
  @Post()
  create(@Body() createContractDto: CreateContractDto, @Request() req: any) {
    console.log('Received contract creation request:', createContractDto);
    return this.contractsService.create(createContractDto);
  }

  /**
   * Get all contracts (with optional filters)
   * GET /api/contracts?status=active&type=rent
   */
  @Get()
  findAll(@Query() query: any) {
    const filters: any = {};

    if (query.status) {
      filters.status = query.status;
    }
    if (query.contractType) {
      filters.contractType = query.contractType;
    }

    return this.contractsService.findAll(filters);
  }

  /**
   * Get contracts for current user (as tenant or landlord)
   * GET /api/contracts/my-contracts
   */
  @Get('my-contracts')
  getMyContracts(@Request() req: any) {
    return this.contractsService.findByUser(req.user.userId);
  }

  /**
   * Get contract statistics for current user
   * GET /api/contracts/statistics
   */
  @Get('statistics')
  getStatistics(@Request() req: any) {
    return this.contractsService.getStatistics(req.user.userId);
  }

  /**
   * Get contracts by property ID
   * GET /api/contracts/property/:propertyId
   */
  @Get('property/:propertyId')
  getByProperty(@Param('propertyId') propertyId: string) {
    return this.contractsService.findByProperty(propertyId);
  }

  /**
   * Get contract by ID
   * GET /api/contracts/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  /**
   * Sign contract (electronic signature)
   * PUT /api/contracts/:id/sign
   */
  @Put(':id/sign')
  signContract(
    @Param('id') id: string,
    @Body() signDto: SignContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.signContract(id, req.user.userId, signDto);
  }

  /**
   * Request contract cancellation
   * POST /api/contracts/:id/cancel
   */
  @Post(':id/cancel')
  requestCancellation(
    @Param('id') id: string,
    @Body() cancelDto: CancelContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.requestCancellation(
      id,
      req.user.userId,
      cancelDto,
    );
  }

  /**
   * Approve or reject contract cancellation
   * PUT /api/contracts/:id/approve-cancel
   */
  @Put(':id/approve-cancel')
  approveCancellation(
    @Param('id') id: string,
    @Body() approveDto: ApproveCancellationDto,
    @Request() req: any,
  ) {
    return this.contractsService.approveCancellation(
      id,
      req.user.userId,
      approveDto.approved,
    );
  }

  /**
   * Update contract status
   * PUT /api/contracts/:id/status
   */
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.contractsService.updateStatus(id, status);
  }

  /**
   * Delete contract (only drafts)
   * DELETE /api/contracts/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.contractsService.remove(id, req.user.userId);
  }
}
