import { FastifyRequest, FastifyReply } from 'fastify';
import { getSettings, updateSettings } from '../services/settings.service.js';
import { updateSettingsSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';

export async function getSettingsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const settings = await getSettings();
    return reply.send(settings);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateSettingsHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const data = updateSettingsSchema.parse(request.body);
    const settings = await updateSettings(data);
    return reply.send(settings);
  } catch (error) {
    return handleError(error, reply);
  }
}

