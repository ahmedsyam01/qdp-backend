import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from '../../modules/properties/schemas/property.schema';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

@Injectable()
export class PropertySeeder {
  constructor(
    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async seed() {
    const count = await this.propertyModel.countDocuments();
    if (count > 0) {
      console.log('⚠️  Properties already exist. Deleting old properties to re-seed with images...');
      await this.propertyModel.deleteMany({});
    }

    // Get existing users for property ownership
    const users = await this.userModel.find().limit(4).lean();
    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    const properties = [
      // Luxury Apartments in The Pearl - AVAILABLE FOR BOTH RENT AND SALE
      {
        userId: users[0]._id,
        title: 'Luxury 3BR Apartment in The Pearl Qatar',
        description: 'Stunning 3-bedroom apartment with sea views, premium finishes, and access to world-class amenities in The Pearl Qatar. Fully furnished with modern appliances. Available for rent or purchase.',
        propertyType: 'apartment',
        category: 'sale', // Keep for backward compatibility
        price: 2500000, // Sale price
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: true,
          rentPrice: 12000, // 12,000 QR/month
          salePrice: 2500000, // 2.5M QR
          contractDuration: 12, // 12 months
          numberOfInstallments: 12, // 12 monthly installments
          insuranceDeposit: 12000, // 1 month deposit
        },
        specifications: {
          bedrooms: 3,
          bathrooms: 4,
          livingRooms: 2,
          areaSqm: 250,
          floorNumber: 15,
          totalFloors: 25,
          parkingSpaces: 2,
          furnishingStatus: 'furnished',
        },
        propertyCondition: 'new',
        facade: 'north',
        location: {
          address: 'Porto Arabia Drive, The Pearl Qatar',
          city: 'Doha',
          area: 'The Pearl Qatar',
          building: 'Porto Arabia Tower',
          landmark: 'Near Medina Centrale',
          coordinates: {
            type: 'Point',
            coordinates: [51.5511293, 25.3742015],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', isCover: true, order: 1 },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', isCover: false, order: 2 },
        ],
        amenities: ['24/7 Security', 'Swimming Pool', 'Gym / Fitness Center', 'Covered Parking', 'Elevator', 'Concierge Service', 'Central AC', 'Sea View'],
        status: 'active',
        isFeatured: true,
        viewsCount: 145,
        publishedAt: new Date(),
      },

      // West Bay Office Space - RENT ONLY
      {
        userId: users[1]._id,
        title: 'Premium Office Space in West Bay',
        description: 'Modern office space with stunning city and sea views. Perfect for corporate headquarters or regional offices. Grade A building with 24/7 security and smart building features.',
        propertyType: 'office',
        category: 'rent',
        price: 15000,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 15000, // 15,000 QR/month
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 15000,
        },
        specifications: {
          areaSqm: 350,
          floorNumber: 20,
          totalFloors: 35,
          parkingSpaces: 5,
          furnishingStatus: 'unfurnished',
        },
        propertyCondition: 'excellent',
        facade: 'multiple',
        location: {
          address: 'Al Corniche Street, West Bay',
          city: 'Doha',
          area: 'West Bay',
          building: 'West Bay Tower',
          landmark: 'Near Sheraton Park',
          coordinates: {
            type: 'Point',
            coordinates: [51.5311448, 25.3212055],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'Covered Parking', 'Elevator', 'Central AC', 'City View', 'Internet / WiFi'],
        status: 'active',
        isFeatured: true,
        viewsCount: 89,
        publishedAt: new Date(),
      },

      // Villa in Al Rayyan - RENT ONLY
      {
        userId: users[2]._id,
        title: 'Spacious 5BR Villa with Private Pool - Al Rayyan',
        description: 'Beautiful standalone villa featuring 5 spacious bedrooms, private swimming pool, landscaped garden, and maid\'s room. Located in a quiet family-friendly compound.',
        propertyType: 'villa',
        category: 'rent',
        price: 18000,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 18000, // 18,000 QR/month
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 18000,
        },
        specifications: {
          bedrooms: 5,
          bathrooms: 6,
          livingRooms: 3,
          areaSqm: 450,
          parkingSpaces: 3,
          furnishingStatus: 'semi-furnished',
        },
        propertyCondition: 'excellent',
        facade: 'south',
        location: {
          address: 'Al Waab Compound, Al Rayyan',
          city: 'Al Rayyan',
          area: 'Al Waab',
          building: 'Villa 25',
          landmark: 'Near Education City',
          coordinates: {
            type: 'Point',
            coordinates: [51.4011, 25.2506],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', isCover: true, order: 1 },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isCover: false, order: 2 },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', isCover: false, order: 3 },
        ],
        amenities: ['24/7 Security', 'Swimming Pool', 'Garden', 'BBQ Area', 'Covered Parking', 'Maid\'s Room', 'Storage Room', 'Split AC'],
        status: 'active',
        isFeatured: true,
        viewsCount: 203,
        publishedAt: new Date(),
      },

      // Apartment in Lusail - SALE ONLY
      {
        userId: users[0]._id,
        title: 'Brand New 2BR Apartment in Lusail City',
        description: 'Modern 2-bedroom apartment in Lusail\'s premium Marina District. Features contemporary design, smart home technology, and access to world-class amenities.',
        propertyType: 'apartment',
        category: 'sale',
        price: 1800000,
        currency: 'QAR',
        availableFor: {
          rent: false,
          sale: true,
          salePrice: 1800000, // 1.8M QR
        },
        specifications: {
          bedrooms: 2,
          bathrooms: 3,
          livingRooms: 1,
          areaSqm: 150,
          floorNumber: 8,
          totalFloors: 20,
          parkingSpaces: 1,
          furnishingStatus: 'unfurnished',
        },
        propertyCondition: 'new',
        facade: 'west',
        location: {
          address: 'Marina District, Lusail City',
          city: 'Lusail',
          area: 'Lusail',
          building: 'Marina Residences',
          landmark: 'Near Lusail Stadium',
          coordinates: {
            type: 'Point',
            coordinates: [51.5186012, 25.4223208],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'Swimming Pool', 'Gym / Fitness Center', 'Kids Play Area', 'Covered Parking', 'Elevator', 'Central AC', 'Balcony'],
        status: 'active',
        isFeatured: false,
        viewsCount: 67,
        publishedAt: new Date(),
      },

      // Studio in Al Sadd - RENT ONLY
      {
        userId: users[1]._id,
        title: 'Cozy Studio Apartment in Al Sadd',
        description: 'Perfect studio apartment for singles or couples. Fully furnished with modern amenities. Walking distance to restaurants, shops, and public transportation.',
        propertyType: 'apartment',
        category: 'rent',
        price: 3500,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 3500,
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 3500,
        },
        specifications: {
          bedrooms: 1,
          bathrooms: 1,
          livingRooms: 0,
          areaSqm: 45,
          floorNumber: 3,
          totalFloors: 8,
          parkingSpaces: 1,
          furnishingStatus: 'furnished',
        },
        propertyCondition: 'good',
        facade: 'east',
        location: {
          address: 'Al Sadd Street',
          city: 'Doha',
          area: 'Al Sadd',
          building: 'Al Sadd Residences',
          landmark: 'Near Al Sadd Sports Club',
          coordinates: {
            type: 'Point',
            coordinates: [51.4400847, 25.2789583],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'Elevator', 'Split AC', 'Covered Parking', 'Internet / WiFi'],
        status: 'active',
        isFeatured: false,
        viewsCount: 43,
        publishedAt: new Date(),
      },

      // Commercial Land - SALE ONLY
      {
        userId: users[2]._id,
        title: 'Prime Commercial Land in Al Wakrah',
        description: 'Excellent investment opportunity! Commercial plot with high visibility on main road. Suitable for retail, showroom, or mixed-use development. All utilities available.',
        propertyType: 'land',
        category: 'sale',
        price: 5000000,
        currency: 'QAR',
        availableFor: {
          rent: false,
          sale: true,
          salePrice: 5000000,
        },
        specifications: {
          areaSqm: 2000,
          furnishingStatus: 'unfurnished',
        },
        propertyCondition: 'new',
        facade: 'multiple',
        location: {
          address: 'Al Wakrah Main Road',
          city: 'Al Wakrah',
          area: 'Al Wakrah',
          landmark: 'Near Souq Al Wakrah',
          coordinates: {
            type: 'Point',
            coordinates: [51.5972094, 25.1704126],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', isCover: true, order: 1 },
        ],
        amenities: ['Electricity Backup', 'Water Supply'],
        status: 'active',
        isFeatured: false,
        viewsCount: 31,
        publishedAt: new Date(),
      },

      // Warehouse - RENT ONLY
      {
        userId: users[3]._id,
        title: 'Large Warehouse with Office Space - Industrial Area',
        description: 'Spacious warehouse facility with attached office space, loading dock, and ample parking. Ideal for logistics, distribution, or manufacturing operations.',
        propertyType: 'warehouse',
        category: 'rent',
        price: 25000,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 25000,
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 25000,
        },
        specifications: {
          areaSqm: 800,
          parkingSpaces: 10,
          furnishingStatus: 'unfurnished',
        },
        propertyCondition: 'good',
        facade: 'north',
        location: {
          address: 'Industrial Area Street 38',
          city: 'Doha',
          area: 'Industrial Area',
          landmark: 'Near Qatar Industrial Manufacturing Company',
          coordinates: {
            type: 'Point',
            coordinates: [51.4733, 25.2194],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'CCTV Surveillance', 'Open Parking', 'Electricity Backup', 'Water Supply'],
        status: 'active',
        isFeatured: false,
        viewsCount: 22,
        publishedAt: new Date(),
      },

      // Showroom - RENT ONLY
      {
        userId: users[0]._id,
        title: 'Premium Car Showroom in Salwa Road',
        description: 'High-end car showroom with glass facade, excellent visibility, and spacious display area. Perfect for luxury automotive brands. Includes service area and offices.',
        propertyType: 'showroom',
        category: 'rent',
        price: 35000,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 35000,
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 35000,
        },
        specifications: {
          areaSqm: 500,
          parkingSpaces: 15,
          furnishingStatus: 'semi-furnished',
        },
        propertyCondition: 'excellent',
        facade: 'multiple',
        location: {
          address: 'Salwa Road',
          city: 'Doha',
          area: 'Al Aziziya',
          landmark: 'Near Qatar Decoration',
          coordinates: {
            type: 'Point',
            coordinates: [51.5008, 25.2836],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'CCTV Surveillance', 'Open Parking', 'Central AC', 'Elevator'],
        status: 'active',
        isFeatured: true,
        viewsCount: 58,
        publishedAt: new Date(),
      },

      // Family Apartment - RENT ONLY
      {
        userId: users[1]._id,
        title: '4BR Family Apartment in Al Mansoura',
        description: 'Spacious family apartment with 4 bedrooms, balcony, and modern amenities. Close to schools, hospitals, and shopping centers. Well-maintained building with friendly community.',
        propertyType: 'apartment',
        category: 'rent',
        price: 8500,
        currency: 'QAR',
        availableFor: {
          rent: true,
          sale: false,
          rentPrice: 8500,
          contractDuration: 12,
          numberOfInstallments: 12,
          insuranceDeposit: 8500,
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 3,
          livingRooms: 2,
          areaSqm: 180,
          floorNumber: 5,
          totalFloors: 10,
          parkingSpaces: 2,
          furnishingStatus: 'semi-furnished',
        },
        propertyCondition: 'good',
        facade: 'south',
        location: {
          address: 'Al Mansoura District',
          city: 'Doha',
          area: 'Al Mansoura',
          building: 'Al Mansoura Towers',
          landmark: 'Near Al Mansoura Park',
          coordinates: {
            type: 'Point',
            coordinates: [51.5082896, 25.3104587],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'Elevator', 'Kids Play Area', 'Covered Parking', 'Split AC', 'Balcony', 'Built-in Wardrobes'],
        status: 'active',
        isFeatured: false,
        viewsCount: 76,
        publishedAt: new Date(),
      },

      // Penthouse - SALE ONLY
      {
        userId: users[2]._id,
        title: 'Luxury Penthouse with Rooftop Terrace - Msheireb',
        description: 'Exclusive penthouse in Msheireb Downtown with panoramic city views, private rooftop terrace, and premium finishes throughout. Features smart home technology and designer interiors.',
        propertyType: 'apartment',
        category: 'sale',
        price: 4500000,
        currency: 'QAR',
        availableFor: {
          rent: false,
          sale: true,
          salePrice: 4500000,
        },
        specifications: {
          bedrooms: 4,
          bathrooms: 5,
          livingRooms: 3,
          areaSqm: 400,
          floorNumber: 30,
          totalFloors: 30,
          parkingSpaces: 3,
          furnishingStatus: 'furnished',
        },
        propertyCondition: 'new',
        facade: 'multiple',
        location: {
          address: 'Msheireb Downtown Doha',
          city: 'Doha',
          area: 'Msheireb Downtown',
          building: 'Msheireb Luxury Residences',
          landmark: 'Near Souq Waqif',
          coordinates: {
            type: 'Point',
            coordinates: [51.5299146, 25.2858103],
          },
        },
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', isCover: true, order: 1 },
          { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', isCover: false, order: 2 },
        ],
        amenities: ['24/7 Security', 'Concierge Service', 'Swimming Pool', 'Gym / Fitness Center', 'Covered Parking', 'Elevator', 'Central AC', 'Terrace', 'City View', 'Built-in Kitchen Appliances'],
        status: 'active',
        isFeatured: true,
        viewsCount: 312,
        publishedAt: new Date(),
      },
    ];

    // Generate 90 additional properties programmatically
    const propertyTemplates = [
      { type: 'apartment', category: 'rent', priceRange: [3000, 15000], bedroomRange: [1, 4], areaRange: [50, 250] },
      { type: 'apartment', category: 'sale', priceRange: [800000, 3500000], bedroomRange: [2, 5], areaRange: [100, 300] },
      { type: 'villa', category: 'rent', priceRange: [15000, 30000], bedroomRange: [4, 7], areaRange: [350, 600] },
      { type: 'villa', category: 'sale', priceRange: [3000000, 8000000], bedroomRange: [5, 8], areaRange: [400, 800] },
      { type: 'office', category: 'rent', priceRange: [10000, 40000], bedroomRange: [0, 0], areaRange: [200, 800] },
      { type: 'land', category: 'sale', priceRange: [2000000, 10000000], bedroomRange: [0, 0], areaRange: [500, 5000] },
      { type: 'warehouse', category: 'rent', priceRange: [20000, 50000], bedroomRange: [0, 0], areaRange: [500, 2000] },
      { type: 'showroom', category: 'rent', priceRange: [25000, 60000], bedroomRange: [0, 0], areaRange: [300, 1000] },
    ];

    const qatarLocations = [
      { city: 'Doha', area: 'Al Sadd', coordinates: [51.4400847, 25.2789583] },
      { city: 'Doha', area: 'Al Mansoura', coordinates: [51.5082896, 25.3104587] },
      { city: 'Doha', area: 'West Bay', coordinates: [51.5311448, 25.3212055] },
      { city: 'Doha', area: 'The Pearl Qatar', coordinates: [51.5511293, 25.3742015] },
      { city: 'Doha', area: 'Al Aziziya', coordinates: [51.5008, 25.2836] },
      { city: 'Doha', area: 'Bin Mahmoud', coordinates: [51.5403, 25.2778] },
      { city: 'Doha', area: 'Al Jasra', coordinates: [51.5037, 25.2656] },
      { city: 'Al Rayyan', area: 'Al Waab', coordinates: [51.4011, 25.2506] },
      { city: 'Lusail', area: 'Lusail', coordinates: [51.5186012, 25.4223208] },
      { city: 'Al Wakrah', area: 'Al Wakrah', coordinates: [51.5972094, 25.1704126] },
    ];

    const furnishingStatuses = ['furnished', 'semi-furnished', 'unfurnished'];
    const conditions = ['new', 'excellent', 'good', 'fair'];
    const facades = ['north', 'south', 'east', 'west', 'multiple'];

    // Real property images from Unsplash
    const propertyImages = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800',
    ];

    for (let i = 0; i < 90; i++) {
      const template = propertyTemplates[i % propertyTemplates.length];
      const location = qatarLocations[i % qatarLocations.length];
      const user = users[i % users.length];

      const bedrooms = template.type === 'apartment' || template.type === 'villa'
        ? Math.floor(Math.random() * (template.bedroomRange[1] - template.bedroomRange[0] + 1)) + template.bedroomRange[0]
        : undefined;

      const bathrooms = bedrooms ? Math.max(1, Math.floor(bedrooms * 0.75)) : undefined;
      const livingRooms = bedrooms && bedrooms >= 3 ? Math.floor(Math.random() * 2) + 1 : undefined;

      const areaSqm = Math.floor(Math.random() * (template.areaRange[1] - template.areaRange[0] + 1)) + template.areaRange[0];
      const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0] + 1)) + template.priceRange[0];

      // Randomize availability: 70% single purpose, 30% dual purpose
      const isDualPurpose = Math.random() > 0.7;
      const isRentAvailable = template.category === 'rent' || (template.category === 'sale' && isDualPurpose);
      const isSaleAvailable = template.category === 'sale' || (template.category === 'rent' && isDualPurpose);

      const rentPrice = template.category === 'rent' ? price : Math.floor(price * 0.005); // ~0.5% of sale price per month
      const salePrice = template.category === 'sale' ? price : rentPrice * 200; // ~16 years rent

      const property: any = {
        userId: user._id,
        title: `${template.type.charAt(0).toUpperCase() + template.type.slice(1)} ${bedrooms ? bedrooms + 'BR' : ''} in ${location.area}${isDualPurpose ? ' - Rent or Sale' : (template.category === 'sale' ? ' - For Sale' : ' - For Rent')}`,
        description: `Quality ${template.type} in ${location.area}, ${location.city}. ${bedrooms ? bedrooms + ' bedrooms,' : ''} ${areaSqm}sqm. ${isDualPurpose ? 'Available for rent or purchase' : template.category === 'sale' ? 'Great investment opportunity' : 'Available for immediate occupancy'}.`,
        propertyType: template.type,
        category: template.category,
        price,
        currency: 'QAR',
        availableFor: {
          rent: isRentAvailable,
          sale: isSaleAvailable,
          ...(isRentAvailable && {
            rentPrice,
            contractDuration: 12,
            numberOfInstallments: 12,
            insuranceDeposit: rentPrice,
          }),
          ...(isSaleAvailable && {
            salePrice,
          }),
        },
        specifications: {
          areaSqm,
          furnishingStatus: furnishingStatuses[Math.floor(Math.random() * furnishingStatuses.length)],
        },
        propertyCondition: conditions[Math.floor(Math.random() * conditions.length)],
        facade: facades[Math.floor(Math.random() * facades.length)],
        location: {
          address: `Street ${Math.floor(Math.random() * 100) + 1}, ${location.area}`,
          city: location.city,
          area: location.area,
          building: `Building ${Math.floor(Math.random() * 50) + 1}`,
          landmark: `Near landmark ${Math.floor(Math.random() * 10) + 1}`,
          coordinates: {
            type: 'Point',
            coordinates: [location.coordinates[0] + (Math.random() * 0.01 - 0.005), location.coordinates[1] + (Math.random() * 0.01 - 0.005)],
          },
        },
        images: [
          { url: propertyImages[i % propertyImages.length], isCover: true, order: 1 },
        ],
        amenities: ['24/7 Security', 'Covered Parking', 'Elevator', 'Central AC'],
        status: 'active',
        isFeatured: Math.random() > 0.8,
        viewsCount: Math.floor(Math.random() * 200),
        publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      };

      if (bedrooms) {
        property.specifications.bedrooms = bedrooms;
        property.specifications.bathrooms = bathrooms;
        property.specifications.livingRooms = livingRooms;
      }

      if (template.type === 'apartment' || template.type === 'office') {
        property.specifications.floorNumber = Math.floor(Math.random() * 25) + 1;
        property.specifications.totalFloors = property.specifications.floorNumber + Math.floor(Math.random() * 10) + 5;
      }

      if (template.type !== 'land') {
        property.specifications.parkingSpaces = Math.floor(Math.random() * 5) + 1;
      }

      properties.push(property);
    }

    const created = await this.propertyModel.insertMany(properties);
    console.log(`✅ ${created.length} properties seeded successfully`);
  }
}
