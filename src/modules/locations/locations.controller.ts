import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    if (type) {
      return this.locationsService.findByType(type);
    }
    return this.locationsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Get(':id/children')
  async findChildren(@Param('id') parentId: string) {
    return this.locationsService.findByParentId(parentId);
  }
}
