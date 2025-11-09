import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property, PropertySchema } from './schemas/property.schema';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    UploadModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService, MongooseModule],
})
export class PropertiesModule {}
