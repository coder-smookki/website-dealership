import { Lead } from '../models/Lead.js';
import { AppError } from '../utils/errors.js';
import { Types } from 'mongoose';

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: 'new' | 'in_progress' | 'closed';
  carId?: string;
  q?: string;
  sort?: string;
}

export async function getLeads(filters: LeadFilters = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    carId,
    q,
    sort = 'createdAt',
  } = filters;

  const query: any = {};

  if (status) {
    query.status = status;
  }

  if (carId) {
    query.carId = new Types.ObjectId(carId);
  }

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortQuery: Record<string, 1 | -1> = sort === 'createdAt' ? { createdAt: -1 } : { createdAt: 1 };

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('carId', 'title brand model price images')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getLeadById(id: string) {
  const lead = await Lead.findById(id)
    .populate('carId', 'title brand model price images')
    .lean();
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }
  return lead;
}

export async function createLead(data: {
  carId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}) {
  const lead = await Lead.create({
    ...data,
    carId: new Types.ObjectId(data.carId),
  });
  return lead.populate('carId', 'title brand model price images');
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'in_progress' | 'closed'
) {
  const lead = await Lead.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate('carId', 'title brand model price images');
  
  if (!lead) {
    throw new AppError(404, 'Lead not found');
  }
  
  return lead;
}

