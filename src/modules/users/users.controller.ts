import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<User> {
    return this.usersService.findById(req.user.userId);
  }

  @Put('profile')
  // @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: any,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(req.user.userId, updateData);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }

  @Put('fcm-token')
  // @UseGuards(JwtAuthGuard)
  async updateFcmToken(
    @Request() req: any,
    @Body('fcmToken') fcmToken: string,
  ): Promise<void> {
    return this.usersService.updateFcmToken(req.user.userId, fcmToken);
  }

  @Put('notification-preferences')
  // @UseGuards(JwtAuthGuard)
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() preferences: Partial<User['notificationPreferences']>,
  ): Promise<void> {
    return this.usersService.updateNotificationPreferences(
      req.user.userId,
      preferences,
    );
  }
}
