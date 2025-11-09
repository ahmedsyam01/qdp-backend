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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminUsersService } from './admin-users.service';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async findAll(@Query() filters: FilterUsersDto) {
    return this.adminUsersService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserAdminDto, @Request() req: any) {
    return this.adminUsersService.create(createUserDto, req.user.sub);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserAdminDto,
    @Request() req: any,
  ) {
    return this.adminUsersService.update(id, updateDto, req.user.sub);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.adminUsersService.updateStatus(id, status, req.user.sub);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.adminUsersService.softDelete(id, req.user.sub);
  }

  @Get(':id/activity')
  async getUserActivity(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.adminUsersService.getUserActivity(id, limit ? parseInt(limit) : 20);
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.adminUsersService.getUserStats(id);
  }
}
