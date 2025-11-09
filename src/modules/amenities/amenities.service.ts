import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity, AmenityDocument } from './schemas/amenity.schema';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectModel(Amenity.name)
    private amenityModel: Model<AmenityDocument>,
  ) {}

  async findAll(): Promise<Amenity[]> {
    return this.amenityModel.find({ isActive: true }).exec();
  }

  async findByCategory(category: string): Promise<Amenity[]> {
    return this.amenityModel.find({ category, isActive: true }).exec();
  }

  async findById(id: string): Promise<Amenity | null> {
    return this.amenityModel.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<Amenity[]> {
    return this.amenityModel.find({ _id: { $in: ids } }).exec();
  }

  async create(createAmenityDto: any): Promise<Amenity> {
    const amenity = new this.amenityModel(createAmenityDto);
    return amenity.save();
  }
}
