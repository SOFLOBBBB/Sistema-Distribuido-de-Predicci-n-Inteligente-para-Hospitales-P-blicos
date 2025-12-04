/**
 * JWT Strategy
 * 
 * [MODULE 2]: Security - JWT token validation strategy
 * 
 * @description Passport strategy for validating JWT tokens
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';

export interface JwtPayload {
  sub: string;      // User ID
  email: string;
  role: string;
  iat?: number;     // Issued at
  exp?: number;     // Expiration
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default_secret_change_me'),
    });
  }

  /**
   * Validate JWT payload and return user
   * Called automatically by Passport after token verification
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

