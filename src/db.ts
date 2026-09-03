import pg from 'pg';
import type { Topic } from './domain.js';
import type { ProviderResult } from './domain.js';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

export async function findActiveTopic(id: number): Promise<Topic | undefined> {
  const result = await pool.query<Topic>('SELECT id, title, url, sms_template_id, param_name FROM sms_topics WHERE id=$1 AND is_active=true', [id]);
  return result.rows[0];
}

export async function logRequest(input: { agentId: number; name: string; mobile: string; topicId: number; outcome: 'sent'|'failed'|'timeout'; result?: ProviderResult; errorCode?: string }): Promise<void> {
  const r = input.result;
  await pool.query(`INSERT INTO sms_requests (agent_id,recipient_name,recipient_mobile,topic_id,provider_message_id,provider_status,provider_message,cost,outcome,error_code,provider_response)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [input.agentId, input.name, input.mobile, input.topicId, r?.data?.messageId ?? null, r?.status ?? null, r?.message ?? null, r?.data?.cost ?? null, input.outcome, input.errorCode ?? null, r ? JSON.stringify(r) : null]);
}

export async function closeDatabase(): Promise<void> { await pool.end(); }
