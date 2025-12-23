import { FastifyRequest, FastifyReply } from 'fastify';
import { getSettings, updateSettings } from '../services/settings.service.js';
import { updateSettingsSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export async function getSettingsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const settings = await getSettings();
    return sendSuccess(reply, settings);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateSettingsHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  try {
    const data = updateSettingsSchema.parse(request.body);
    const settings = await updateSettings(data);
    return sendSuccess(reply, settings);
  } catch (error) {
    return handleError(error, reply);
  }
}

