import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  LeadFilters,
} from '../services/leads.service.js';
import { createLeadSchema, updateLeadStatusSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export async function listLeads(
  request: FastifyRequest<{ Querystring: LeadFilters }>,
  reply: FastifyReply
) {
  try {
    const result = await getLeads(request.query);
    return sendSuccess(reply, result);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getLead(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const lead = await getLeadById(request.params.id);
    return sendSuccess(reply, lead);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createLeadHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  try {
    const data = createLeadSchema.parse(request.body);
    const lead = await createLead(data);
    return sendSuccess(reply, lead, 201);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateLeadStatusHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: { status: 'new' | 'in_progress' | 'closed' } }>,
  reply: FastifyReply
) {
  try {
    const data = updateLeadStatusSchema.parse(request.body);
    const lead = await updateLeadStatus(request.params.id, data.status);
    return sendSuccess(reply, lead);
  } catch (error) {
    return handleError(error, reply);
  }
}

