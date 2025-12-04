/**
 * Users Service
 * 
 * [MODULE 2]: Business logic for user management
 * 
 * @author Sofía Castellanos Lobo
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all users (for admin dashboard)
   */
  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map(({ passwordHash, ...user }) => user as Omit<User, 'passwordHash'>);
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Reactivate user account
   */
  async activate(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = true;
    await this.userRepository.save(user);
  }

  /**
   * Get user statistics for dashboard
   */
  async getStatistics() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { isActive: true } });
    const byRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      byRole,
    };
  }
}

