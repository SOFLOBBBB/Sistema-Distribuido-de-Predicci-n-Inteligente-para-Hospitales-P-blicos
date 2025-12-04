/**
 * Users Controller
 * 
 * [MODULE 2]: REST API endpoints for user management
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators';
import { UserRole } from '../common/enums';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users
   * Get all users (Admin only)
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /api/v1/users/statistics
   * Get user statistics (Admin only)
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID (Admin only)
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  /**
   * PATCH /api/v1/users/:id/deactivate
   * Deactivate user account (Admin only)
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deactivate(id);
    return { message: 'User deactivated successfully' };
  }

  /**
   * PATCH /api/v1/users/:id/activate
   * Activate user account (Admin only)
   */
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.activate(id);
    return { message: 'User activated successfully' };
  }
}

