import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  LeadFilters,
} from '../services/leads.service.js';
import { sendSuccess } from '../utils/response.js';
import {
  leadParamsSchema,
  createLeadBodySchema,
  updateLeadStatusBodySchema,
} from '../schemas/index.js';
import type { z } from 'zod';

type LeadParams = z.infer<typeof leadParamsSchema>;
type CreateLeadBody = z.infer<typeof createLeadBodySchema>;
type UpdateLeadStatusBody = z.infer<typeof updateLeadStatusBodySchema>;

export async function listLeads(
  request: FastifyRequest<{ Querystring: LeadFilters }>,
  reply: FastifyReply
) {
  const result = await getLeads(request.query);
  return sendSuccess(reply, result);
}

export async function getLead(
  request: FastifyRequest<{ Params: LeadParams }>,
  reply: FastifyReply
) {
  const lead = await getLeadById(request.params.id);
  return sendSuccess(reply, lead);
}

export async function createLeadHandler(
  request: FastifyRequest<{ Body: CreateLeadBody }>,
  reply: FastifyReply
) {
  const lead = await createLead(request.body);
  return sendSuccess(reply, lead, 201);
}

export async function updateLeadStatusHandler(
  request: FastifyRequest<{ Params: LeadParams; Body: UpdateLeadStatusBody }>,
  reply: FastifyReply
) {
  const lead = await updateLeadStatus(request.params.id, request.body.status);
  return sendSuccess(reply, lead);
}
