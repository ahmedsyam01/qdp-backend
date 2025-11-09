import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFiltersDto } from './dto/property-filters.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
    private uploadService: UploadService,
  ) {}

  async create(
    userId: string,
    createPropertyDto: CreatePropertyDto,
  ): Promise<Property> {
    const property = new this.propertyModel({
      ...createPropertyDto,
      userId: new Types.ObjectId(userId),
      status: 'pending',
    });
    return property.save();
  }

  async findAll(
    filters: PropertyFiltersDto,
    userId?: string,
  ): Promise<{ properties: Property[]; total: number; page: number; totalPages: number }> {
    const query: any = { status: 'active' };

    // Property type filter
    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    // Category filter (sale/rent)
    if (filters.category) {
      query.category = filters.category;
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      query['specifications.bedrooms'] = filters.bedrooms;
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      query['specifications.bathrooms'] = filters.bathrooms;
    }

    // Area range filter
    if (filters.minArea || filters.maxArea) {
      query['specifications.areaSqm'] = {};
      if (filters.minArea) query['specifications.areaSqm'].$gte = filters.minArea;
      if (filters.maxArea) query['specifications.areaSqm'].$lte = filters.maxArea;
    }

    // Location filter
    if (filters.city) {
      query['location.city'] = filters.city;
    }
    if (filters.area) {
      query['location.area'] = filters.area;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      query.amenities = { $all: filters.amenities };
    }

    // Furnishing status filter
    if (filters.furnishingStatus) {
      query['specifications.furnishingStatus'] = filters.furnishingStatus;
    }

    // Property condition filter
    if (filters.propertyCondition) {
      query.propertyCondition = filters.propertyCondition;
    }

    // Text search
    if (filters.searchTerm) {
      query.$text = { $search: filters.searchTerm };
    }

    // Geospatial search (nearby properties)
    if (filters.longitude && filters.latitude && filters.radiusKm) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filters.longitude, filters.latitude],
          },
          $maxDistance: filters.radiusKm * 1000, // Convert km to meters
        },
      };
    }

    // Sorting
    let sort: any = {};
    switch (filters.sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'date_asc':
        sort.createdAt = 1;
        break;
      case 'date_desc':
        sort.createdAt = -1;
        break;
      case 'area_asc':
        sort['specifications.areaSqm'] = 1;
        break;
      case 'area_desc':
        sort['specifications.areaSqm'] = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    const [properties, total] = await Promise.all([
      this.propertyModel
        .find(query)
        .populate('userId', 'fullName phone profilePicture')
        .sort(sort)
        .limit(limit)
        .skip(offset)
        .lean(),
      this.propertyModel.countDocuments(query),
    ]);

    // Add isFavorite flag if user is authenticated
    let propertiesWithFavorites = properties;
    if (userId) {
      const propertyIds = properties.map((p: any) => p._id.toString());
      const favorites = await this.favoriteModel
        .find({
          userId: new Types.ObjectId(userId),
          propertyId: { $in: propertyIds },
        })
        .lean();

      const favoritePropertyIds = new Set(
        favorites.map((f: any) => f.propertyId.toString()),
      );

      propertiesWithFavorites = properties.map((property: any) => ({
        ...property,
        isFavorite: favoritePropertyIds.has(property._id.toString()),
      }));
    }

    const totalPages = Math.ceil(total / limit);

    return {
      properties: propertiesWithFavorites as Property[],
      total,
      page,
      totalPages,
    };
  }

  async findById(id: string, userId?: string): Promise<Property> {
    const property = await this.propertyModel
      .findById(id)
      .populate('userId', 'fullName phone profilePicture email')
      .lean();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if favorited
    let isFavorite = false;
    if (userId) {
      const favorite = await this.favoriteModel
        .findOne({
          userId: new Types.ObjectId(userId),
          propertyId: new Types.ObjectId(id),
        })
        .lean();
      isFavorite = !!favorite;
    }

    return { ...property, isFavorite } as any;
  }

  async update(
    id: string,
    userId: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    Object.assign(property, updatePropertyDto);
    return property.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.propertyModel.findByIdAndDelete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await this.propertyModel.findByIdAndUpdate(id, {
      $inc: { viewsCount: 1 },
    });
  }

  async findByUserId(userId: string): Promise<Property[]> {
    return this.propertyModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Favorites
  async addFavorite(userId: string, propertyId: string): Promise<void> {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    try {
      await this.favoriteModel.create({
        userId: new Types.ObjectId(userId),
        propertyId: new Types.ObjectId(propertyId),
      });
    } catch (error) {
      // Ignore duplicate key error (already favorited)
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    await this.favoriteModel.deleteOne({
      userId: new Types.ObjectId(userId),
      propertyId: new Types.ObjectId(propertyId),
    });
  }

  async getFavorites(userId: string): Promise<Property[]> {
    const favorites = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'propertyId',
        populate: {
          path: 'userId',
          select: 'fullName phone profilePicture',
        },
      })
      .lean();

    return favorites
      .map((f: any) => ({
        ...f.propertyId,
        isFavorite: true,
      }))
      .filter((p) => p._id); // Filter out null properties
  }

  // Geospatial - Find nearby properties
  async findNearby(
    longitude: number,
    latitude: number,
    radiusKm: number = 5,
    limit: number = 20,
  ): Promise<Property[]> {
    return this.propertyModel
      .find({
        status: 'active',
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusKm * 1000, // Convert km to meters
          },
        },
      })
      .limit(limit)
      .populate('userId', 'fullName phone profilePicture')
      .lean();
  }

  // Find similar properties
  async findSimilar(id: string, limit: number = 5): Promise<Property[]> {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.propertyModel
      .find({
        _id: { $ne: id },
        status: 'active',
        propertyType: property.propertyType,
        category: property.category,
        price: {
          $gte: property.price * 0.8,
          $lte: property.price * 1.2,
        },
        'location.city': property.location.city,
      })
      .limit(limit)
      .populate('userId', 'fullName phone profilePicture')
      .lean();
  }

  // Image upload
  async uploadImages(
    propertyId: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.propertyModel.findById(propertyId);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId.toString() !== userId) {
      throw new ForbiddenException('You can only upload images to your own properties');
    }

    // Upload images
    const urls = await this.uploadService.uploadMultipleImages(files);

    // Add images to property
    const currentMaxOrder = property.images.length > 0
      ? Math.max(...property.images.map(img => img.order))
      : 0;

    const newImages = urls.map((url, index) => ({
      url,
      isCover: property.images.length === 0 && index === 0, // First image is cover if no images exist
      order: currentMaxOrder + index + 1,
    }));

    property.images.push(...newImages);
    await property.save();

    return property;
  }

  // Delete image
  async deleteImage(imageId: string, userId: string): Promise<void> {
    // imageId format: propertyId:imageUrl
    const [propertyId, ...urlParts] = imageId.split(':');
    const imageUrl = urlParts.join(':'); // In case URL contains colons

    const property = await this.propertyModel.findById(propertyId);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete images from your own properties');
    }

    const imageIndex = property.images.findIndex(img => img.url === imageUrl);

    if (imageIndex === -1) {
      throw new NotFoundException('Image not found');
    }

    // Delete from storage
    await this.uploadService.deleteImage(imageUrl);

    // Remove from property
    property.images.splice(imageIndex, 1);

    // If deleted image was cover, make first image the new cover
    if (property.images.length > 0 && !property.images.some(img => img.isCover)) {
      property.images[0].isCover = true;
    }

    await property.save();
  }
}
