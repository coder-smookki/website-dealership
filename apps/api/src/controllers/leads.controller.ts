import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  LeadFilters,
} from '../services/leads.service.js';
import { createLeadSchema, updateLeadStatusSchema } from '../utils/validate.js';
import { ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export async function listLeads(
  request: FastifyRequest<{ Querystring: LeadFilters }>,
  reply: FastifyReply
) {
  const result = await getLeads(request.query);
  return sendSuccess(reply, result);
}

export async function getLead(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const lead = await getLeadById(request.params.id);
  return sendSuccess(reply, lead);
}

export async function createLeadHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const validated = createLeadSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const lead = await createLead(validated.data);
  return sendSuccess(reply, lead, 201);
}

export async function updateLeadStatusHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: { status: 'new' | 'in_progress' | 'closed' } }>,
  reply: FastifyReply
) {
  const validated = updateLeadStatusSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const lead = await updateLeadStatus(request.params.id, validated.data.status);
  return sendSuccess(reply, lead);
}
