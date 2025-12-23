import { FastifyRequest, FastifyReply } from 'fastify';
import { getSettings, updateSettings } from '../services/settings.service.js';
import { updateSettingsSchema } from '../utils/validate.js';
import { ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export async function getSettingsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const settings = await getSettings();
  return sendSuccess(reply, settings);
}

export async function updateSettingsHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const validated = updateSettingsSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const settings = await updateSettings(validated.data);
  return sendSuccess(reply, settings);
}
