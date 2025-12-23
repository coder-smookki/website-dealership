import { Types } from 'mongoose';
import { Lead } from '../models/Lead.js';
import { Car } from '../models/Car.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

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

  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }

  if (carId) {
    if (!Types.ObjectId.isValid(carId)) {
      throw new ValidationError('Invalid car ID');
    }
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
  const sortQuery = sort === 'createdAt' ? { createdAt: -1 } : { createdAt: 1 };

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return {
    leads: leads.map(lead => ({
      _id: lead._id.toString(),
      carId: lead.carId.toString(),
      carTitle: lead.carTitle,
      carBrand: lead.carBrand,
      carModel: lead.carModel,
      carPrice: lead.carPrice,
      carImages: lead.carImages,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
      status: lead.status,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getLeadById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid lead ID');
  }
  
  const lead = await Lead.findById(id).lean();
  if (!lead) {
    throw new NotFoundError('Lead');
  }
  
  return {
    _id: lead._id.toString(),
    carId: lead.carId.toString(),
    carTitle: lead.carTitle,
    carBrand: lead.carBrand,
    carModel: lead.carModel,
    carPrice: lead.carPrice,
    carImages: lead.carImages,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function createLead(data: {
  carId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}) {
  if (!Types.ObjectId.isValid(data.carId)) {
    throw new ValidationError('Invalid car ID');
  }
  
  // Получаем данные автомобиля для денормализации
  const car = await Car.findById(data.carId).lean();
  if (!car) {
    throw new NotFoundError('Car');
  }
  
  const lead = await Lead.create({
    carId: new Types.ObjectId(data.carId),
    carTitle: car.title,
    carBrand: car.brand,
    carModel: car.model,
    carPrice: car.price,
    carImages: car.images,
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    status: 'new',
  });
  
  return {
    _id: lead._id.toString(),
    carId: lead.carId.toString(),
    carTitle: lead.carTitle,
    carBrand: lead.carBrand,
    carModel: lead.carModel,
    carPrice: lead.carPrice,
    carImages: lead.carImages,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'in_progress' | 'closed'
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid lead ID');
  }
  
  const lead = await Lead.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();
  
  if (!lead) {
    throw new NotFoundError('Lead');
  }
  
  return {
    _id: lead._id.toString(),
    carId: lead.carId.toString(),
    carTitle: lead.carTitle,
    carBrand: lead.carBrand,
    carModel: lead.carModel,
    carPrice: lead.carPrice,
    carImages: lead.carImages,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}
