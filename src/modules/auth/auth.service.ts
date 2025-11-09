import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUserByPhone = await this.usersService.findByPhone(
      registerDto.phone,
    );
    if (existingUserByPhone) {
      throw new ConflictException('Phone number already registered');
    }

    const existingUserByEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUserByIdentity = await this.usersService.findByIdentityNumber(
      registerDto.identityNumber,
    );
    if (existingUserByIdentity) {
      throw new ConflictException('Identity number already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate OTP
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    // TODO: Send OTP via SMS
    console.log(`OTP for ${user.phone}: ${otp}`);

    return {
      message: 'Registration successful. Please verify your phone number.',
      phone: user.phone,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only send OTP in dev mode
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.usersService.findByPhone(loginDto.phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if phone is verified
    if (!user.phoneVerified) {
      throw new UnauthorizedException(
        'Please verify your phone number before logging in',
      );
    }

    // Generate JWT token
    const payload = { sub: user._id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        profilePicture: user.profilePicture,
      },
    };
  }

  async verifyPhone(phone: string, otp: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Verify phone
    await this.usersService.verifyPhone((user as any)._id.toString());

    return {
      message: 'Phone verified successfully',
    };
  }

  async resendOtp(phone: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.phoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOtp((user as any)._id.toString(), otp, otpExpiry);

    // TODO: Send OTP via SMS
    console.log(`New OTP for ${phone}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  async forgotPassword(phone: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate OTP for password reset
    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.updateOtp((user as any)._id.toString(), otp, otpExpiry);

    // TODO: Send OTP via SMS
    console.log(`Password reset OTP for ${phone}: ${otp}`);

    return {
      message: 'OTP sent to your phone',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  async resetPassword(phone: string, otp: string, newPassword: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await this.usersService.update((user as any)._id.toString(), {
      password: hashedPassword,
      otp: undefined,
      otpExpiry: undefined,
    });

    return {
      message: 'Password reset successfully',
    };
  }

  async logout(userId: string) {
    // Clear FCM token
    await this.usersService.updateFcmToken(userId, '');

    return {
      message: 'Logged out successfully',
    };
  }

  // Helper method to generate 5-digit OTP
  private generateOtp(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
}
