import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account with phone verification' })
  @ApiResponse({ status: 201, description: 'User successfully registered. OTP sent to phone.' })
  @ApiResponse({ status: 400, description: 'Bad request. Phone or email already exists.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with phone and password' })
  @ApiResponse({ status: 200, description: 'Successfully logged in. Returns JWT token and user data.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or phone not verified.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-phone')
  @ApiOperation({ summary: 'Verify phone number', description: 'Verify user phone number with OTP code' })
  @ApiResponse({ status: 200, description: 'Phone verified successfully. Returns JWT token.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  @ApiBody({ type: VerifyPhoneDto })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(
      verifyPhoneDto.phone,
      verifyPhoneDto.otp,
    );
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP', description: 'Resend verification OTP to user phone' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  @ApiResponse({ status: 400, description: 'Phone already verified or user not found.' })
  @ApiBody({ type: ResendOtpDto })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.phone);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password', description: 'Request password reset. Sends OTP to user phone.' })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent successfully.' })
  @ApiResponse({ status: 404, description: 'User not found with this phone number.' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.phone);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password', description: 'Reset user password using OTP verification' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.phone,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user', description: 'Logout authenticated user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized. Invalid or missing JWT token.' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }
}
