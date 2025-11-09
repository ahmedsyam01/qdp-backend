import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument } from '../../modules/locations/schemas/location.schema';

@Injectable()
export class LocationSeeder {
  constructor(
    @InjectModel(Location.name)
    private locationModel: Model<LocationDocument>,
  ) {}

  async seed() {
    const count = await this.locationModel.countDocuments();
    if (count > 0) {
      console.log('Locations already seeded');
      return;
    }

    // Qatar locations with real coordinates
    const locations = [
      // Country
      {
        nameEn: 'Qatar',
        nameAr: 'قطر',
        type: 'country',
        coordinates: {
          type: 'Point',
          coordinates: [51.5310398, 25.3548328], // Doha coordinates
        },
      },

      // Major Cities
      {
        nameEn: 'Doha',
        nameAr: 'الدوحة',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [51.5310398, 25.2854473],
        },
      },
      {
        nameEn: 'Al Rayyan',
        nameAr: 'الريان',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [51.4244813, 25.2524037],
        },
      },
      {
        nameEn: 'Al Wakrah',
        nameAr: 'الوكرة',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [51.5972094, 25.1704126],
        },
      },
      {
        nameEn: 'Lusail',
        nameAr: 'لوسيل',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [51.5186012, 25.4223208],
        },
      },
      {
        nameEn: 'Al Khor',
        nameAr: 'الخور',
        type: 'city',
        coordinates: {
          type: 'Point',
          coordinates: [51.4969742, 25.6802925],
        },
      },

      // Doha Areas
      {
        nameEn: 'West Bay',
        nameAr: 'الخليج الغربي',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5311448, 25.3212055],
        },
      },
      {
        nameEn: 'The Pearl Qatar',
        nameAr: 'اللؤلؤة قطر',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5511293, 25.3742015],
        },
      },
      {
        nameEn: 'Katara Cultural Village',
        nameAr: 'كتارا',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5309417, 25.3540886],
        },
      },
      {
        nameEn: 'Old Doha (Souq Waqif)',
        nameAr: 'الدوحة القديمة',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5333252, 25.2873611],
        },
      },
      {
        nameEn: 'Al Sadd',
        nameAr: 'السد',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.4400847, 25.2789583],
        },
      },
      {
        nameEn: 'Al Dafna',
        nameAr: 'الدفنة',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5236264, 25.3189123],
        },
      },
      {
        nameEn: 'Msheireb Downtown',
        nameAr: 'مشيرب',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5299146, 25.2858103],
        },
      },
      {
        nameEn: 'Al Mansoura',
        nameAr: 'المنصورة',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5082896, 25.3104587],
        },
      },
      {
        nameEn: 'Bin Mahmoud',
        nameAr: 'بن محمود',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5331677, 25.2772222],
        },
      },
      {
        nameEn: 'Fereej Abdul Aziz',
        nameAr: 'فريج عبدالعزيز',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5319889, 25.2703333],
        },
      },
      {
        nameEn: 'Al Nasr',
        nameAr: 'النصر',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5236, 25.2561],
        },
      },
      {
        nameEn: 'Al Waab',
        nameAr: 'الوعب',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.4011, 25.2506],
        },
      },
      {
        nameEn: 'Al Aziziya',
        nameAr: 'العزيزية',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5008, 25.2836],
        },
      },
      {
        nameEn: 'Al Hilal',
        nameAr: 'الهلال',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5117, 25.2678],
        },
      },
      {
        nameEn: 'Najma',
        nameAr: 'نجمة',
        type: 'area',
        coordinates: {
          type: 'Point',
          coordinates: [51.5458, 25.2728],
        },
      },
    ];

    const created = await this.locationModel.insertMany(locations);
    console.log(`✅ ${created.length} locations seeded successfully`);
  }
}
