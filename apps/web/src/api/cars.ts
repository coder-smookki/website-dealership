import http from './http';
import type { Car, CreateCarData, CarFilters, CarsResponse } from '../types/car';

export type { Car, CreateCarData, CarFilters, CarsResponse };

export const carsApi = {
  getCars: (filters?: CarFilters): Promise<CarsResponse> => {
    return http.get('/api/cars', { params: filters }).then((res) => res.data);
  },

  getCar: (id: string): Promise<Car> => {
    return http.get(`/api/cars/${id}`).then((res) => res.data);
  },

  createCar: (data: Partial<Car>): Promise<Car> => {
    return http.post('/api/admin/cars', data).then((res) => res.data);
  },

  updateCar: (id: string, data: Partial<Car>): Promise<Car> => {
    return http.patch(`/api/admin/cars/${id}`, data).then((res) => res.data);
  },

  deleteCar: (id: string): Promise<void> => {
    return http.delete(`/api/admin/cars/${id}`).then(() => undefined);
  },

  updateCarStatus: (id: string, status: 'available' | 'reserved' | 'sold'): Promise<Car> => {
    return http.patch(`/api/my/cars/${id}/status`, { status }).then((res) => res.data);
  },

  getMyCars: (filters?: CarFilters): Promise<CarsResponse> => {
    return http.get('/api/my/cars', { params: filters }).then((res) => res.data);
  },

  createMyCar: (data: CreateCarData): Promise<Car> => {
    return http.post('/api/my/cars', data).then((res) => res.data);
  },

  moderateCar: (id: string, moderationStatus: 'approved' | 'rejected', moderationComment?: string): Promise<Car> => {
    return http.patch(`/api/admin/cars/${id}/moderate`, { moderationStatus, moderationComment }).then((res) => res.data);
  },
};
