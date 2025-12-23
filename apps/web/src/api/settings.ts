import http from './http';
import type { Settings } from '../types/settings';

export type { Settings };

export const settingsApi = {
  getSettings: (): Promise<Settings> => {
    return http.get('/settings').then((res) => res.data);
  },

  updateSettings: (data: Partial<Settings>): Promise<Settings> => {
    return http.put('/admin/settings', data).then((res) => res.data);
  },
};
