/**
 * User Roles Enumeration
 * 
 * [MODULE 2]: Role-based access control for authorization
 * 
 * @description Defines the available roles in the system for RBAC
 */

export enum UserRole {
  /** System administrator with full access */
  ADMIN = 'ADMIN',
  
  /** Medical doctor - can view patients and request predictions */
  DOCTOR = 'DOCTOR',
  
  /** Data analyst - can view statistics and prediction history */
  ANALYST = 'ANALYST',
}

