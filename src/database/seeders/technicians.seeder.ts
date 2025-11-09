import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technician } from '../../modules/technicians/schemas/technician.schema';

@Injectable()
export class TechniciansSeeder {
  constructor(
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<Technician>,
  ) {}

  async seed() {
    const count = await this.technicianModel.countDocuments();
    if (count > 0) {
      console.log('Technicians already seeded');
      return;
    }

    const technicians = [
      {
        nameAr: 'محمد علي الكواري',
        nameEn: 'Mohamed Ali Al-Kuwari',
        phone: '+97455551234',
        email: 'mohamed.ali@qdp-services.qa',
        specialization: 'ac',
        idNumber: '28011234567',
        yearsOfExperience: 8,
        skills: [
          'AC Installation',
          'AC Repair',
          'AC Maintenance',
          'Duct Cleaning',
          'Refrigerant Charging',
        ],
        status: 'active',
        totalJobs: 145,
        completedJobs: 138,
        currentJobs: 2,
        averageRating: 4.8,
        ratings: [],
      },
      {
        nameAr: 'حسن أحمد الدوسري',
        nameEn: 'Hassan Ahmed Al-Dosari',
        phone: '+97455559876',
        email: 'hassan.ahmed@qdp-services.qa',
        specialization: 'plumbing',
        idNumber: '28012345678',
        yearsOfExperience: 6,
        skills: [
          'Pipe Installation',
          'Leak Repair',
          'Drain Cleaning',
          'Water Heater Repair',
          'Bathroom Fixtures',
        ],
        status: 'active',
        totalJobs: 98,
        completedJobs: 94,
        currentJobs: 1,
        averageRating: 4.7,
        ratings: [],
      },
      {
        nameAr: 'علي محمود النعيمي',
        nameEn: 'Ali Mahmoud Al-Naimi',
        phone: '+97455553333',
        email: 'ali.mahmoud@qdp-services.qa',
        specialization: 'electrical',
        idNumber: '28013456789',
        yearsOfExperience: 10,
        skills: [
          'Electrical Wiring',
          'Circuit Breaker Installation',
          'Lighting Installation',
          'Power Outlet Repair',
          'Electrical Panel Upgrade',
        ],
        status: 'busy',
        totalJobs: 210,
        completedJobs: 205,
        currentJobs: 3,
        averageRating: 4.9,
        ratings: [],
      },
      {
        nameAr: 'سالم حسن العبدالله',
        nameEn: 'Salem Hassan Al-Abdullah',
        phone: '+97455554444',
        email: 'salem.hassan@qdp-services.qa',
        specialization: 'ac',
        idNumber: '28014567890',
        yearsOfExperience: 5,
        skills: [
          'AC Installation',
          'AC Repair',
          'Split AC Specialist',
          'Central AC Systems',
        ],
        status: 'active',
        totalJobs: 67,
        completedJobs: 65,
        currentJobs: 1,
        averageRating: 4.6,
        ratings: [],
      },
      {
        nameAr: 'خالد محمد الخليفي',
        nameEn: 'Khaled Mohamed Al-Khulaifi',
        phone: '+97455555555',
        email: 'khaled.mohamed@qdp-services.qa',
        specialization: 'furniture',
        idNumber: '28015678901',
        yearsOfExperience: 7,
        skills: [
          'Furniture Assembly',
          'Furniture Repair',
          'Wood Polishing',
          'Upholstery Repair',
          'Cabinet Installation',
        ],
        status: 'active',
        totalJobs: 123,
        completedJobs: 120,
        currentJobs: 0,
        averageRating: 4.5,
        ratings: [],
      },
      {
        nameAr: 'أحمد سعيد الهاجري',
        nameEn: 'Ahmed Saeed Al-Hajari',
        phone: '+97455556666',
        email: 'ahmed.saeed@qdp-services.qa',
        specialization: 'plumbing',
        idNumber: '28016789012',
        yearsOfExperience: 4,
        skills: [
          'Bathroom Plumbing',
          'Kitchen Plumbing',
          'Emergency Repairs',
          'Pipe Installation',
        ],
        status: 'active',
        totalJobs: 54,
        completedJobs: 52,
        currentJobs: 1,
        averageRating: 4.4,
        ratings: [],
      },
      {
        nameAr: 'يوسف عبدالله الثاني',
        nameEn: 'Youssef Abdullah Al-Thani',
        phone: '+97455557777',
        email: 'youssef.abdullah@qdp-services.qa',
        specialization: 'electrical',
        idNumber: '28017890123',
        yearsOfExperience: 9,
        skills: [
          'Smart Home Installation',
          'Electrical Troubleshooting',
          'Generator Installation',
          'Security Systems',
        ],
        status: 'active',
        totalJobs: 189,
        completedJobs: 185,
        currentJobs: 2,
        averageRating: 4.8,
        ratings: [],
      },
      {
        nameAr: 'عمر فيصل المهندي',
        nameEn: 'Omar Faisal Al-Mohannadi',
        phone: '+97455558888',
        email: 'omar.faisal@qdp-services.qa',
        specialization: 'furniture',
        idNumber: '28018901234',
        yearsOfExperience: 3,
        skills: [
          'Furniture Assembly',
          'Minor Repairs',
          'Furniture Moving',
          'Installation Services',
        ],
        status: 'active',
        totalJobs: 42,
        completedJobs: 41,
        currentJobs: 0,
        averageRating: 4.3,
        ratings: [],
      },
    ];

    await this.technicianModel.insertMany(technicians);
    console.log('✅ Technicians seeded successfully');
  }
}
