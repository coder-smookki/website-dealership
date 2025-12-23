import { ObjectId } from 'mongodb';

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

export interface CreateUserDTO {
  email: string;
  password: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserPublic {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  createdAt: Date;
}

