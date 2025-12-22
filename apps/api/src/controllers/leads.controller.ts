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

export async function listLeads(
  request: FastifyRequest<{ Querystring: LeadFilters }>,
  reply: FastifyReply
) {
  try {
    const result = await getLeads(request.query);
    return reply.send(result);
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
    return reply.send(lead);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createLeadHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const data = createLeadSchema.parse(request.body);
    const lead = await createLead(data);
    return reply.code(201).send(lead);
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
    return reply.send(lead);
  } catch (error) {
    return handleError(error, reply);
  }
}

