import { ObjectId } from 'mongodb';

/**
 * Domain Entity - User
 * Represents a user in the system (admin or car owner)
 */
export interface UserEntity {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation DTO
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
}

/**
 * User update DTO
 */
export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

/**
 * User public representation (without sensitive data)
 */
export interface UserPublic {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  createdAt: Date;
}

