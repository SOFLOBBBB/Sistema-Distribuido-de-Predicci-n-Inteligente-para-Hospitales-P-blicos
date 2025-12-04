/**
 * Authentication Service
 * 
 * [MODULE 2]: Security - User authentication with JWT and bcrypt
 * 
 * @author Sofía Castellanos Lobo
 */

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities';
import { LoginDto, LoginResponseDto, RegisterDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserRole } from '../common/enums';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticate user and return JWT token
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Register a new user
   * Only ADMINs can create users with specific roles
   */
  async register(
    registerDto: RegisterDto,
    creatorRole?: UserRole,
  ): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Only ADMIN can set roles other than ANALYST
    let assignedRole = UserRole.ANALYST;
    if (role && creatorRole === UserRole.ADMIN) {
      assignedRole = role;
    } else if (role && creatorRole !== UserRole.ADMIN) {
      throw new BadRequestException('Only administrators can assign roles');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: assignedRole,
      isActive: true,
    });

    await this.userRepository.save(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  /**
   * Validate user exists and is active
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.userRepository.save(user);
  }
}

