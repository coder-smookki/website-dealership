import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getCarsCollection, getUsersCollection, CarDocument } from '../db/collections.js';
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

interface CarResponse {
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
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapCarToResponse(car: CarDocument): CarResponse {
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

  const db = getDatabase();
  const carsCollection = getCarsCollection(db);

  const query: Record<string, unknown> = {};

  if (status) query.status = status;

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

  if (brand) query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };

  if (yearFrom || yearTo) {
    query.year = {};
    if (yearFrom) (query.year as Record<string, unknown>).$gte = yearFrom;
    if (yearTo) (query.year as Record<string, unknown>).$lte = yearTo;
  }

  if (priceFrom || priceTo) {
    query.price = {};
    if (priceFrom) (query.price as Record<string, unknown>).$gte = priceFrom;
    if (priceTo) (query.price as Record<string, unknown>).$lte = priceTo;
  }

  if (fuelType) query.fuelType = fuelType;
  if (transmission) query.transmission = transmission;
  if (drive) query.drive = drive;

  if (ownerId) {
    if (!ObjectId.isValid(ownerId)) throw new ValidationError('Invalid owner ID');
    query.ownerId = new ObjectId(ownerId);
  }

  if (createdBy) {
    if (!ObjectId.isValid(createdBy)) throw new ValidationError('Invalid createdBy ID');
    query.createdBy = new ObjectId(createdBy);
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
    carsCollection.find(query).sort(sortQuery).skip(skip).limit(limit).toArray(),
    carsCollection.countDocuments(query),
  ]);

  return {
    cars: cars.map(mapCarToResponse),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCarById(id: string, includePending = false): Promise<CarResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid car ID');
  
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const car = await carsCollection.findOne({ _id: new ObjectId(id) });
  
  if (!car) throw new NotFoundError('Car');
  if (!includePending && car.moderationStatus !== 'approved') throw new NotFoundError('Car');
  
  return mapCarToResponse(car);
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
): Promise<CarResponse> {
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const usersCollection = getUsersCollection(db);
  
  if (!ObjectId.isValid(data.ownerId)) throw new ValidationError('Invalid owner ID');
  if (!ObjectId.isValid(createdBy)) throw new ValidationError('Invalid createdBy ID');
  
  // Денормализация: получаем данные владельца
  const owner = await usersCollection.findOne({ _id: new ObjectId(data.ownerId) });
  if (!owner) throw new NotFoundError('Owner');
  
  const moderationStatus = userRole === 'admin' ? 'approved' : 'pending';
  const now = new Date();
  
  const car: Omit<CarDocument, '_id'> = {
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
    ownerId: new ObjectId(data.ownerId),
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerPhone: owner.phone,
    createdBy: new ObjectId(createdBy),
    createdAt: now,
    updatedAt: now,
  } as Omit<CarDocument, '_id'>;
  
  const result = await carsCollection.insertOne(car as CarDocument);
  
  return mapCarToResponse({ ...car, _id: result.insertedId } as CarDocument);
}

export async function updateCar(
  id: string,
  data: Partial<CarDocument>
): Promise<CarResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid car ID');
  
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const usersCollection = getUsersCollection(db);
  
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
  
  // Денормализация при изменении владельца
  if (data.ownerId) {
    const ownerIdStr = typeof data.ownerId === 'string' ? data.ownerId : data.ownerId.toString();
    if (!ObjectId.isValid(ownerIdStr)) throw new ValidationError('Invalid owner ID');
    
    const owner = await usersCollection.findOne({ _id: new ObjectId(ownerIdStr) });
    if (!owner) throw new NotFoundError('Owner');
    
    updateData.ownerId = new ObjectId(ownerIdStr);
    updateData.ownerName = owner.name;
    updateData.ownerEmail = owner.email;
    updateData.ownerPhone = owner.phone;
  }
  
  const result = await carsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  if (!result) throw new NotFoundError('Car');
  
  return mapCarToResponse(result);
}

export async function deleteCar(id: string): Promise<{ success: boolean }> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid car ID');
  
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
  
  if (result.deletedCount === 0) throw new NotFoundError('Car');
  
  return { success: true };
}

export async function updateCarStatus(
  id: string,
  status: 'available' | 'reserved' | 'sold'
): Promise<CarResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid car ID');
  
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const result = await carsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  
  if (!result) throw new NotFoundError('Car');
  
  return mapCarToResponse(result);
}

export async function moderateCar(
  id: string,
  moderationStatus: 'approved' | 'rejected',
  moderationComment?: string
): Promise<CarResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid car ID');
  
  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  
  const updateData: Record<string, unknown> = {
    moderationStatus,
    updatedAt: new Date(),
  };
  
  if (moderationComment) updateData.moderationComment = moderationComment;
  
  const result = await carsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  if (!result) throw new NotFoundError('Car');
  
  return mapCarToResponse(result);
}
