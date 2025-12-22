import http from './http';

export interface Settings {
  _id: string;
  phone: string;
  email: string;
  address: string;
  workHours: string;
  slogan: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  getSettings: (): Promise<Settings> => {
    return http.get('/api/settings').then((res) => res.data);
  },

  updateSettings: (data: Partial<Settings>): Promise<Settings> => {
    return http.put('/api/admin/settings', data).then((res) => res.data);
  },
};

