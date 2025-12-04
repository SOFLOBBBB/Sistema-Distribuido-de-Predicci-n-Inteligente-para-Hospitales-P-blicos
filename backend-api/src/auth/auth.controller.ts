/**
 * Authentication Controller
 * 
 * [MODULE 2]: REST API endpoints for authentication
 * [MODULE 3]: Distributed communication - API layer
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, RegisterDto } from './dto';
import { Public, Roles, CurrentUser } from './decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../common/enums';
import { User } from '../database/entities';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return JWT token
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * POST /api/v1/auth/register
   * Register a new user (Admin only for role assignment)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async register(
    @Body() registerDto: RegisterDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.authService.register(registerDto, currentUser.role);
  }

  /**
   * POST /api/v1/auth/register-initial
   * Register the first admin user (only works if no users exist)
   */
  @Public()
  @Post('register-initial')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register initial admin user (only when no users exist)' })
  @ApiResponse({ status: 201, description: 'Initial admin created successfully' })
  @ApiResponse({ status: 409, description: 'Users already exist' })
  async registerInitialAdmin(@Body() registerDto: RegisterDto) {
    // This will create an ADMIN user, but only if it's the first user
    return this.authService.register({
      ...registerDto,
      role: UserRole.ADMIN,
    });
  }

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user profile
   */
  @UseGuards(JwtAuthGuard)
  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

