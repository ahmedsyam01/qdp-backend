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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFiltersDto } from './dto/property-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Public endpoints
  @Get()
  @ApiOperation({ summary: 'Get all properties with filters' })
  @ApiResponse({ status: 200, description: 'Returns list of properties' })
  async findAll(@Query() filters: PropertyFiltersDto, @Request() req: any) {
    const userId = req.user?.userId;
    return this.propertiesService.findAll(filters, userId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby properties using geospatial search' })
  @ApiResponse({ status: 200, description: 'Returns nearby properties' })
  async findNearby(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radiusKm') radiusKm?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findNearby(
      longitude,
      latitude,
      radiusKm,
      limit,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId;
    return this.propertiesService.findById(id, userId);
  }

  @Get(':id/similar')
  async findSimilar(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findSimilar(id, limit);
  }

  @Post(':id/view')
  async incrementViews(@Param('id') id: string) {
    await this.propertiesService.incrementViews(id);
    return { message: 'View count incremented' };
  }

  // Protected endpoints (require authentication)
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new property listing' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req: any, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(req.user.userId, createPropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update property (owner only)' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, req.user.userId, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.propertiesService.remove(id, req.user.userId);
    return { message: 'Property deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/my-properties')
  async getMyProperties(@Request() req: any) {
    return this.propertiesService.findByUserId(req.user.userId);
  }

  // Favorites endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@Param('id') propertyId: string, @Request() req: any) {
    await this.propertiesService.addFavorite(req.user.userId, propertyId);
    return { message: 'Property added to favorites' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(@Param('id') propertyId: string, @Request() req: any) {
    await this.propertiesService.removeFavorite(req.user.userId, propertyId);
    return { message: 'Property removed from favorites' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/favorites')
  async getFavorites(@Request() req: any) {
    return this.propertiesService.getFavorites(req.user.userId);
  }

  // Image upload endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload images to property' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id') id: string,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.uploadImages(id, req.user.userId, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:imageId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete property image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
  async deleteImage(
    @Param('imageId') imageId: string,
    @Request() req: any,
  ) {
    await this.propertiesService.deleteImage(imageId, req.user.userId);
    return { message: 'Image deleted successfully' };
  }
}
