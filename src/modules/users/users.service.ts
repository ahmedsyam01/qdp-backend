import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone }).select('+password').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByIdentityNumber(identityNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ identityNumber }).exec();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async updateOtp(userId: string, otp: string, otpExpiry: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { otp, otpExpiry }).exec();
  }

  async verifyPhone(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      phoneVerified: true,
      otp: null,
      otpExpiry: null,
    }).exec();
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      emailVerified: true
    }).exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { fcmToken }).exec();
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<User['notificationPreferences']>,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      notificationPreferences: preferences,
    }).exec();
  }
}
