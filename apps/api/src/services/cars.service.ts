import { Types } from 'mongoose';
import { Car } from '../models/Car.js';
import { User } from '../models/User.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

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

  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }

  if (moderationStatus !== undefined) {
    query.moderationStatus = moderationStatus;
  } else if (!ownerId && !createdBy) {
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
    if (yearFrom) query.year = { ...query.year as Record<string, unknown>, $gte: yearFrom };
    if (yearTo) query.year = { ...query.year as Record<string, unknown>, $lte: yearTo };
  }

  if (priceFrom || priceTo) {
    query.price = {};
    if (priceFrom) query.price = { ...query.price as Record<string, unknown>, $gte: priceFrom };
    if (priceTo) query.price = { ...query.price as Record<string, unknown>, $lte: priceTo };
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
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new ValidationError('Invalid owner ID');
    }
    query.ownerId = new Types.ObjectId(ownerId);
  }

  if (createdBy) {
    if (!Types.ObjectId.isValid(createdBy)) {
      throw new ValidationError('Invalid createdBy ID');
    }
    query.createdBy = new Types.ObjectId(createdBy);
  }

  const skip = (page - 1) * limit;

  let sortQuery: Record<string, 1 | -1> = {};
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
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(query),
  ]);

  return {
    cars: cars.map(car => ({
      _id: car._id.toString(),
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      price: car.price,
      currency: car.currency,
      fuelType: car.fuelType,
      transmission: car.transmission,
      drive: car.drive,
      engine: car.engine,
      powerHp: car.powerHp,
      color: car.color,
      description: car.description,
      features: car.features,
      images: car.images,
      status: car.status,
      moderationStatus: car.moderationStatus,
      moderationComment: car.moderationComment,
      ownerId: car.ownerId.toString(),
      ownerName: car.ownerName,
      ownerEmail: car.ownerEmail,
      ownerPhone: car.ownerPhone,
      createdBy: car.createdBy.toString(),
      createdAt: car.createdAt,
      updatedAt: car.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCarById(id: string, includePending = false) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID');
  }
  
  const car = await Car.findById(id).lean();
  if (!car) {
    throw new NotFoundError('Car');
  }
  
  if (!includePending && car.moderationStatus !== 'approved') {
    throw new NotFoundError('Car');
  }
  
  return {
    _id: car._id.toString(),
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    currency: car.currency,
    fuelType: car.fuelType,
    transmission: car.transmission,
    drive: car.drive,
    engine: car.engine,
    powerHp: car.powerHp,
    color: car.color,
    description: car.description,
    features: car.features,
    images: car.images,
    status: car.status,
    moderationStatus: car.moderationStatus,
    moderationComment: car.moderationComment,
    ownerId: car.ownerId.toString(),
    ownerName: car.ownerName,
    ownerEmail: car.ownerEmail,
    ownerPhone: car.ownerPhone,
    createdBy: car.createdBy.toString(),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export async function createCar(
  data: {
    title: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    currency?: string;
    fuelType: string;
    transmission: string;
    drive: string;
    engine: string;
    powerHp: number;
    color: string;
    description: string;
    features?: string[];
    images?: string[];
    status?: 'available' | 'reserved' | 'sold';
    ownerId: string;
  },
  createdBy: string,
  userRole?: 'admin' | 'owner'
) {
  const moderationStatus = userRole === 'admin' ? 'approved' : 'pending';
  
  // Получаем данные владельца для денормализации
  if (!Types.ObjectId.isValid(data.ownerId)) {
    throw new ValidationError('Invalid owner ID');
  }
  
  const owner = await User.findById(data.ownerId);
  if (!owner) {
    throw new NotFoundError('Owner');
  }
  
  if (!Types.ObjectId.isValid(createdBy)) {
    throw new ValidationError('Invalid createdBy ID');
  }
  
  const car = await Car.create({
    title: data.title,
    brand: data.brand,
    model: data.model,
    year: data.year,
    mileage: data.mileage,
    price: data.price,
    currency: data.currency || 'RUB',
    fuelType: data.fuelType,
    transmission: data.transmission,
    drive: data.drive,
    engine: data.engine,
    powerHp: data.powerHp,
    color: data.color,
    description: data.description,
    features: data.features || [],
    images: data.images || [],
    status: data.status || 'available',
    moderationStatus,
    ownerId: new Types.ObjectId(data.ownerId),
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerPhone: owner.phone,
    createdBy: new Types.ObjectId(createdBy),
  });
  
  return {
    _id: car._id.toString(),
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    currency: car.currency,
    fuelType: car.fuelType,
    transmission: car.transmission,
    drive: car.drive,
    engine: car.engine,
    powerHp: car.powerHp,
    color: car.color,
    description: car.description,
    features: car.features,
    images: car.images,
    status: car.status,
    moderationStatus: car.moderationStatus,
    moderationComment: car.moderationComment,
    ownerId: car.ownerId.toString(),
    ownerName: car.ownerName,
    ownerEmail: car.ownerEmail,
    ownerPhone: car.ownerPhone,
    createdBy: car.createdBy.toString(),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export async function updateCar(
  id: string,
  data: {
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    price?: number;
    currency?: string;
    fuelType?: string;
    transmission?: string;
    drive?: string;
    engine?: string;
    powerHp?: number;
    color?: string;
    description?: string;
    features?: string[];
    images?: string[];
    status?: 'available' | 'reserved' | 'sold';
    ownerId?: string;
  }
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID');
  }
  
  const updateData: Record<string, unknown> = { ...data };
  
  // Если обновляется ownerId, нужно обновить денормализованные данные
  if (data.ownerId) {
    if (!Types.ObjectId.isValid(data.ownerId)) {
      throw new ValidationError('Invalid owner ID');
    }
    const owner = await User.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError('Owner');
    }
    updateData.ownerId = new Types.ObjectId(data.ownerId);
    updateData.ownerName = owner.name;
    updateData.ownerEmail = owner.email;
    updateData.ownerPhone = owner.phone;
  }
  
  const car = await Car.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();
  
  if (!car) {
    throw new NotFoundError('Car');
  }
  
  return {
    _id: car._id.toString(),
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    currency: car.currency,
    fuelType: car.fuelType,
    transmission: car.transmission,
    drive: car.drive,
    engine: car.engine,
    powerHp: car.powerHp,
    color: car.color,
    description: car.description,
    features: car.features,
    images: car.images,
    status: car.status,
    moderationStatus: car.moderationStatus,
    moderationComment: car.moderationComment,
    ownerId: car.ownerId.toString(),
    ownerName: car.ownerName,
    ownerEmail: car.ownerEmail,
    ownerPhone: car.ownerPhone,
    createdBy: car.createdBy.toString(),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export async function deleteCar(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID');
  }
  
  const result = await Car.findByIdAndDelete(id);
  
  if (!result) {
    throw new NotFoundError('Car');
  }
  
  return { success: true };
}

export async function updateCarStatus(id: string, status: 'available' | 'reserved' | 'sold') {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID');
  }
  
  const car = await Car.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();
  
  if (!car) {
    throw new NotFoundError('Car');
  }
  
  return {
    _id: car._id.toString(),
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    currency: car.currency,
    fuelType: car.fuelType,
    transmission: car.transmission,
    drive: car.drive,
    engine: car.engine,
    powerHp: car.powerHp,
    color: car.color,
    description: car.description,
    features: car.features,
    images: car.images,
    status: car.status,
    moderationStatus: car.moderationStatus,
    moderationComment: car.moderationComment,
    ownerId: car.ownerId.toString(),
    ownerName: car.ownerName,
    ownerEmail: car.ownerEmail,
    ownerPhone: car.ownerPhone,
    createdBy: car.createdBy.toString(),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}

export async function moderateCar(
  id: string,
  moderationStatus: 'approved' | 'rejected',
  moderationComment?: string
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid car ID');
  }
  
  const updateData: Record<string, unknown> = {
    moderationStatus,
  };
  
  if (moderationComment) {
    updateData.moderationComment = moderationComment;
  }
  
  const car = await Car.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();
  
  if (!car) {
    throw new NotFoundError('Car');
  }
  
  return {
    _id: car._id.toString(),
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    price: car.price,
    currency: car.currency,
    fuelType: car.fuelType,
    transmission: car.transmission,
    drive: car.drive,
    engine: car.engine,
    powerHp: car.powerHp,
    color: car.color,
    description: car.description,
    features: car.features,
    images: car.images,
    status: car.status,
    moderationStatus: car.moderationStatus,
    moderationComment: car.moderationComment,
    ownerId: car.ownerId.toString(),
    ownerName: car.ownerName,
    ownerEmail: car.ownerEmail,
    ownerPhone: car.ownerPhone,
    createdBy: car.createdBy.toString(),
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
  };
}
