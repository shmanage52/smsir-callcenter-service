import type { Config } from './config.js';
import type { ProviderResult, Topic } from './domain.js';

export class SmsIrClient {
  constructor(private readonly settings: Pick<Config, 'SMSIR_API_KEY'|'SMSIR_BASE_URL'|'SMSIR_TIMEOUT_MS'>) {}

  async sendVerify(mobile: string, topic: Topic): Promise<ProviderResult> {
    const response = await fetch(`${this.settings.SMSIR_BASE_URL}/v1/send/verify`, {
      method: 'POST', signal: AbortSignal.timeout(this.settings.SMSIR_TIMEOUT_MS),
      headers: { 'content-type': 'application/json', 'x-api-key': this.settings.SMSIR_API_KEY },
      body: JSON.stringify({ mobile, templateId: topic.sms_template_id, parameters: [{ name: topic.param_name, value: topic.url }] })
    });
    const body = await response.json().catch(() => ({ status: 0, message: 'Invalid provider response' })) as ProviderResult;
    if (!response.ok && body.status === undefined) return { status: response.status, message: 'Provider HTTP error' };
    return body;
  }
}
