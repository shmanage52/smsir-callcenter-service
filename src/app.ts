import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import type { Config } from './config.js';
import { criticalStatuses, normalizeIranianMobile, operatorMessage } from './domain.js';
import { findActiveTopic, logRequest } from './db.js';
import { SmsIrClient } from './smsir.js';
import { alertCritical } from './alerts.js';

const requestSchema = z.object({ agent_id: z.number().int().positive(), name: z.string().trim().min(1).max(160), mobile: z.string().trim(), topic_id: z.number().int().positive() });

export function buildApp(settings: Config) {
  const app = Fastify({ logger: { level: settings.NODE_ENV === 'production' ? 'info' : 'debug' }, requestIdHeader: 'x-request-id' });
  const client = new SmsIrClient(settings);
  app.register(helmet);
  app.register(rateLimit, { max: 30, timeWindow: '1 minute' });
  app.get('/health', async () => ({ status: 'ok' }));
  app.post('/v1/sms-requests', async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ success: false, message: 'اطلاعات فرم معتبر نیست.', issues: parsed.error.flatten() });
    const input = parsed.data;
    const mobile = normalizeIranianMobile(input.mobile);
    if (!mobile) return reply.code(400).send({ success: false, message: operatorMessage(104) });
    const topic = await findActiveTopic(input.topic_id);
    if (!topic) return reply.code(404).send({ success: false, message: 'موضوع انتخاب‌شده موجود یا فعال نیست.' });
    try {
      const result = await client.sendVerify(mobile, topic);
      const outcome = result.status === 1 ? 'sent' : 'failed';
      await logRequest({ agentId: input.agent_id, name: input.name, mobile, topicId: topic.id, outcome, result });
      if (result.status === 1) return reply.code(201).send({ success: true, message: 'پیامک با موفقیت برای ارسال ثبت شد.', message_id: result.data?.messageId });
      if (criticalStatuses.has(result.status)) void alertCritical(settings, result.status, request.id);
      return reply.code(422).send({ success: false, message: operatorMessage(result.status), provider_status: result.status });
    } catch (error) {
      const timeout = error instanceof DOMException && error.name === 'TimeoutError';
      await logRequest({ agentId: input.agent_id, name: input.name, mobile, topicId: topic.id, outcome: timeout ? 'timeout' : 'failed', errorCode: timeout ? 'timeout' : 'network_error' });
      request.log.error({ err: error }, 'sms provider request failed');
      return reply.code(503).send({ success: false, message: timeout ? 'سرویس پیامک در زمان مقرر پاسخ نداد؛ درخواست ثبت شد و قابل پیگیری است.' : 'ارتباط با سرویس پیامک برقرار نشد.' });
    }
  });
  return app;
}
