import http from './http';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export const authApi = {
  register: (data: RegisterData): Promise<LoginResponse> => {
    return http.post('/api/auth/register', data).then((res) => res.data);
  },

  login: (email: string, password: string): Promise<LoginResponse> => {
    return http.post('/api/auth/login', { email, password }).then((res) => res.data);
  },

  me: (): Promise<User> => {
    return http.get('/api/auth/me').then((res) => res.data);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

