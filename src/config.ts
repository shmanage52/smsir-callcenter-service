import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  SMSIR_API_KEY: z.string().min(1),
  SMSIR_BASE_URL: z.string().url().default('https://api.sms.ir'),
  SMSIR_TIMEOUT_MS: z.coerce.number().int().min(500).max(30000).default(5000),
  ALERT_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  DELIVERY_POLL_INTERVAL_MS: z.coerce.number().int().min(60000).default(300000)
});

export type Config = z.infer<typeof schema>;
export const config = schema.parse(process.env);
