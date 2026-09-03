import type { Config } from './config.js';
export async function alertCritical(settings: Pick<Config, 'ALERT_WEBHOOK_URL'>, status: number, requestId: string): Promise<void> {
  if (!settings.ALERT_WEBHOOK_URL) return;
  await fetch(settings.ALERT_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ severity: 'critical', source: 'smsir-callcenter', status, requestId }) }).catch(() => undefined);
}
