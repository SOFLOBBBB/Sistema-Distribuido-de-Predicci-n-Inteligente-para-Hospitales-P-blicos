/**
 * Roles Decorator
 * 
 * [MODULE 2]: Security - Specify required roles for a route
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

