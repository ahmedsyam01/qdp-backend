import { Controller, Get, Param, Query } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    if (category) {
      return this.amenitiesService.findByCategory(category);
    }
    return this.amenitiesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.amenitiesService.findById(id);
  }
}
