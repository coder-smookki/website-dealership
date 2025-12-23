import http from './http';
import type { Car, CreateCarData, CarFilters, CarsResponse } from '../types/car';

export type { Car, CreateCarData, CarFilters, CarsResponse };

export const carsApi = {
  getCars: (filters?: CarFilters): Promise<CarsResponse> => {
    return http.get('/cars', { params: filters }).then((res) => res.data);
  },

  getCar: (id: string): Promise<Car> => {
    return http.get(`/cars/${id}`).then((res) => res.data);
  },

  createCar: (data: Partial<Car>): Promise<Car> => {
    return http.post('/admin/cars', data).then((res) => res.data);
  },

  updateCar: (id: string, data: Partial<Car>): Promise<Car> => {
    return http.patch(`/admin/cars/${id}`, data).then((res) => res.data);
  },

  deleteCar: (id: string): Promise<void> => {
    return http.delete(`/admin/cars/${id}`).then(() => undefined);
  },

  updateCarStatus: (id: string, status: 'available' | 'reserved' | 'sold'): Promise<Car> => {
    return http.patch(`/my/cars/${id}/status`, { status }).then((res) => res.data);
  },

  getMyCars: (filters?: CarFilters): Promise<CarsResponse> => {
    return http.get('/my/cars', { params: filters }).then((res) => res.data);
  },

  createMyCar: (data: CreateCarData): Promise<Car> => {
    return http.post('/my/cars', data).then((res) => res.data);
  },

  moderateCar: (id: string, moderationStatus: 'approved' | 'rejected', moderationComment?: string): Promise<Car> => {
    return http.patch(`/admin/cars/${id}/moderate`, { moderationStatus, moderationComment }).then((res) => res.data);
  },
};
