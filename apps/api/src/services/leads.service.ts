import { ObjectId, type Filter } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getLeadsCollection, getCarsCollection, LeadDocument } from '../db/collections.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export interface LeadFilters {
  page?: number | string;
  limit?: number | string;
  status?: 'new' | 'in_progress' | 'closed';
  carId?: string;
  q?: string;
  sort?: 'createdAt' | '-createdAt';
}

interface LeadResponse {
  _id: string;
  carId: string;
  carTitle?: string;
  carBrand?: string;
  carModel?: string;
  carPrice?: number;
  carImages?: string[];
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

function mapLeadToResponse(lead: LeadDocument): LeadResponse {
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

/** Приводит query-значения к безопасным положительным integer */
function toPositiveInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;

  const n =
    typeof value === 'string'
      ? Number.parseInt(value, 10)
      : typeof value === 'number'
        ? value
        : Number(value);

  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

export async function getLeads(filters: LeadFilters = {}) {
  const page = toPositiveInt(filters.page, 1);
  const rawLimit = toPositiveInt(filters.limit, 20);
  const limit = Math.min(rawLimit, 100); // защита от огромных лимитов

  const { status, carId, q, sort = '-createdAt' } = filters;

  const db = getDatabase();
  const leadsCollection = getLeadsCollection(db);

  const query: Filter<LeadDocument> = {};

  if (status) {
    query.status = status;
  }

  if (carId) {
    if (!ObjectId.isValid(carId)) throw new ValidationError('Invalid car ID');
    query.carId = new ObjectId(carId);
  }

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  // ВАЖНО: реальная пагинация в Mongo — сортируем в БД, потом skip/limit в БД
  const skip = (page - 1) * limit;

  // Стабильная сортировка: createdAt + _id (иначе при одинаковом createdAt могут быть дубли/пропуски между страницами)
  const direction = sort === 'createdAt' ? 1 : -1;
  const sortQuery: Record<string, 1 | -1> = { createdAt: direction, _id: direction };

  const [leads, total] = await Promise.all([
    leadsCollection.find(query).sort(sortQuery).skip(skip).limit(limit).toArray(),
    leadsCollection.countDocuments(query),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < pages;

  return {
    leads: leads.map(mapLeadToResponse),
    pagination: {
      page,
      limit,
      total,
      pages,
      hasPrev,
      hasNext,
      prevPage: hasPrev ? page - 1 : null,
      nextPage: hasNext ? page + 1 : null,
    },
  };
}

export async function getLeadById(id: string): Promise<LeadResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid lead ID');

  const db = getDatabase();
  const leadsCollection = getLeadsCollection(db);
  const lead = await leadsCollection.findOne({ _id: new ObjectId(id) });

  if (!lead) throw new NotFoundError('Lead');

  return mapLeadToResponse(lead);
}

export async function createLead(data: {
  carId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<LeadResponse> {
  if (!ObjectId.isValid(data.carId)) throw new ValidationError('Invalid car ID');

  const db = getDatabase();
  const leadsCollection = getLeadsCollection(db);
  const carsCollection = getCarsCollection(db);

  // Денормализация: получаем данные автомобиля
  const car = await carsCollection.findOne({ _id: new ObjectId(data.carId) });
  if (!car) throw new NotFoundError('Car');

  const now = new Date();
  const lead: Omit<LeadDocument, '_id'> = {
    carId: new ObjectId(data.carId),
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
    createdAt: now,
    updatedAt: now,
  } as Omit<LeadDocument, '_id'>;

  const result = await leadsCollection.insertOne(lead as LeadDocument);

  return mapLeadToResponse({ ...lead, _id: result.insertedId } as LeadDocument);
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'in_progress' | 'closed'
): Promise<LeadResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid lead ID');

  const db = getDatabase();
  const leadsCollection = getLeadsCollection(db);

  const result = await leadsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) throw new NotFoundError('Lead');

  return mapLeadToResponse(result);
}
