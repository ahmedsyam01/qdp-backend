import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amenity, AmenitySchema } from './schemas/amenity.schema';
import { AmenitiesService } from './amenities.service';
import { AmenitiesController } from './amenities.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }]),
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService, MongooseModule],
})
export class AmenitiesModule {}
