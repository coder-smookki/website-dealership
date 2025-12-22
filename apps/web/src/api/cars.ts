import http from './http';

export interface Car {
  _id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string;
  powerHp: number;
  color: string;
  description: string;
  features: string[];
  images: string[];
  status: 'available' | 'reserved' | 'sold';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
  ownerId: {
    _id: string;
    name?: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarData {
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string;
  powerHp: number;
  color: string;
  description: string;
  features: string[];
  images: string[];
  status?: 'available' | 'reserved' | 'sold';
  ownerId: string;
}

export interface CarFilters {
  page?: number;
  limit?: number;
  q?: string;
  brand?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  transmission?: string;
  drive?: string;
  status?: 'available' | 'reserved' | 'sold';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  sort?: string;
}

export interface CarsResponse {
  cars: Car[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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

