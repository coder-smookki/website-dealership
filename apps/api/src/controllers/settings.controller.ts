import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSettings, updateSettings } from '../services/settings.service.js';
import { sendSuccess } from '../utils/response.js';
import { updateSettingsBodySchema } from '../schemas/index.js';
import type { z } from 'zod';

type UpdateSettingsBody = z.infer<typeof updateSettingsBodySchema>;

export async function getSettingsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const settings = await getSettings();
  return sendSuccess(reply, settings);
}

export async function updateSettingsHandler(
  request: FastifyRequest<{ Body: UpdateSettingsBody }>,
  reply: FastifyReply
) {
  const settings = await updateSettings(request.body);
  return sendSuccess(reply, settings);
}
