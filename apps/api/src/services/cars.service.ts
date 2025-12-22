import { Car, ICar } from '../models/Car.js';
import { AppError } from '../utils/errors.js';
import { Types } from 'mongoose';

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
  ownerId?: string;
  createdBy?: string;
}

export async function getCars(filters: CarFilters = {}) {
  const {
    page = 1,
    limit = 20,
    q,
    brand,
    yearFrom,
    yearTo,
    priceFrom,
    priceTo,
    fuelType,
    transmission,
    drive,
    status = 'available',
    moderationStatus,
    sort = 'createdAt',
    ownerId,
    createdBy,
  } = filters;

  const query: any = {};

  if (status) {
    query.status = status;
  }

  // Если moderationStatus не указан явно, показываем только одобренные (для публичных запросов)
  if (moderationStatus !== undefined) {
    query.moderationStatus = moderationStatus;
  } else if (!ownerId && !createdBy) {
    // Для публичных запросов показываем только одобренные
    query.moderationStatus = 'approved';
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
    ];
  }

  if (brand) {
    query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
  }

  if (yearFrom || yearTo) {
    query.year = {};
    if (yearFrom) query.year.$gte = yearFrom;
    if (yearTo) query.year.$lte = yearTo;
  }

  if (priceFrom || priceTo) {
    query.price = {};
    if (priceFrom) query.price.$gte = priceFrom;
    if (priceTo) query.price.$lte = priceTo;
  }

  if (fuelType) {
    query.fuelType = fuelType;
  }

  if (transmission) {
    query.transmission = transmission;
  }

  if (drive) {
    query.drive = drive;
  }

  if (ownerId) {
    query.ownerId = new Types.ObjectId(ownerId);
  }

  if (createdBy) {
    query.createdBy = new Types.ObjectId(createdBy);
  }

  const skip = (page - 1) * limit;

  let sortQuery: any = {};
  switch (sort) {
    case 'priceAsc':
      sortQuery = { price: 1 };
      break;
    case 'priceDesc':
      sortQuery = { price: -1 };
      break;
    case 'yearDesc':
      sortQuery = { year: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
  }

  const [cars, total] = await Promise.all([
    Car.find(query)
      .populate('ownerId', 'name email phone')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(query),
  ]);

  return {
    cars,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCarById(id: string, includePending = false) {
  const car = await Car.findById(id).populate('ownerId', 'name email phone').lean();
  if (!car) {
    throw new AppError(404, 'Car not found');
  }
  // Для публичных запросов показываем только одобренные
  if (!includePending && car.moderationStatus !== 'approved') {
    throw new AppError(404, 'Car not found');
  }
  return car;
}

export async function createCar(data: Partial<ICar>, createdBy: string, userRole?: 'admin' | 'owner') {
  // Если создает владелец - статус pending, если админ - approved
  const moderationStatus = userRole === 'admin' ? 'approved' : 'pending';
  
  const car = await Car.create({
    ...data,
    createdBy: new Types.ObjectId(createdBy),
    ownerId: new Types.ObjectId(data.ownerId as any),
    moderationStatus,
  });
  return car.populate('ownerId', 'name email phone');
}

export async function updateCar(id: string, data: Partial<ICar>) {
  if (data.ownerId) {
    data.ownerId = new Types.ObjectId(data.ownerId as any) as any;
  }

  const car = await Car.findByIdAndUpdate(id, data, { new: true })
    .populate('ownerId', 'name email phone');
  
  if (!car) {
    throw new AppError(404, 'Car not found');
  }
  
  return car;
}

export async function deleteCar(id: string) {
  const car = await Car.findByIdAndDelete(id);
  if (!car) {
    throw new AppError(404, 'Car not found');
  }
  return car;
}

export async function updateCarStatus(id: string, status: 'available' | 'reserved' | 'sold') {
  const car = await Car.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate('ownerId', 'name email phone');
  
  if (!car) {
    throw new AppError(404, 'Car not found');
  }
  
  return car;
}

export async function moderateCar(
  id: string,
  moderationStatus: 'approved' | 'rejected',
  moderationComment?: string
) {
  const updateData: any = { moderationStatus };
  if (moderationComment) {
    updateData.moderationComment = moderationComment;
  }
  
  const car = await Car.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  ).populate('ownerId', 'name email phone');
  
  if (!car) {
    throw new AppError(404, 'Car not found');
  }
  
  return car;
}

