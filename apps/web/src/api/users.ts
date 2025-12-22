import http from './http';

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  getUsers: (filters?: { role?: 'admin' | 'owner'; isActive?: boolean }): Promise<User[]> => {
    return http.get('/api/admin/users', { params: filters }).then((res) => res.data);
  },

  getUser: (id: string): Promise<User> => {
    return http.get(`/api/admin/users/${id}`).then((res) => res.data);
  },

  createUser: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role?: 'admin' | 'owner';
  }): Promise<User> => {
    return http.post('/api/admin/users', data).then((res) => res.data);
  },

  updateUser: (id: string, data: { name?: string; phone?: string; isActive?: boolean }): Promise<User> => {
    return http.patch(`/api/admin/users/${id}`, data).then((res) => res.data);
  },
};

