import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PropertyListing, PropertyListingSchema } from './schemas/property-listing.schema';
import { Property, PropertySchema } from '../properties/schemas/property.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyListing.name, schema: PropertyListingSchema },
      { name: Property.name, schema: PropertySchema },
    ]),
  ],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
