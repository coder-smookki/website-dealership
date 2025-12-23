import http from './http';

export interface Lead {
  _id: string;
  carId: {
    _id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    images: string[];
  };
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: 'new' | 'in_progress' | 'closed';
  carId?: string;
  q?: string;
  sort?: string;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const leadsApi = {
  createLead: (data: {
    carId: string;
    name: string;
    phone: string;
    email?: string;
    message?: string;
  }): Promise<Lead> => {
    return http.post('/leads', data).then((res) => res.data);
  },

  getLeads: (filters?: LeadFilters): Promise<LeadsResponse> => {
    return http.get('/admin/leads', { params: filters }).then((res) => res.data);
  },

  getLead: (id: string): Promise<Lead> => {
    return http.get(`/admin/leads/${id}`).then((res) => res.data);
  },

  updateLeadStatus: (id: string, status: 'new' | 'in_progress' | 'closed'): Promise<Lead> => {
    return http.patch(`/admin/leads/${id}`, { status }).then((res) => res.data);
  },
};

