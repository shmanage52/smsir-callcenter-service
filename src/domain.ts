export type Topic = { id: number; title: string; url: string; sms_template_id: number; param_name: string };
export type ProviderResult = { status: number; message: string; data?: { messageId?: number; cost?: number } };

export function normalizeIranianMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s-]/g, '');
  if (/^09\d{9}$/.test(compact)) return compact;
  if (/^\+989\d{9}$/.test(compact)) return `0${compact.slice(3)}`;
  return null;
}

export function operatorMessage(status: number | undefined): string {
  const messages: Record<number, string> = {
    102: 'اعتبار حساب پیامک کافی نیست. با مدیر فنی تماس بگیرید.',
    113: 'قالب پیامک این موضوع در سیستم درست پیکربندی نشده است.',
    115: 'این شماره در فهرست دریافت‌نکردن پیامک قرار دارد.',
    104: 'شمارهٔ موبایل معتبر نیست.',
    114: 'مقدار پارامتر قالب بیش از حد مجاز است.',
    117: 'پارامتر قالب پیامک تأیید نشده یا نام آن نادرست است.'
  };
  return messages[status ?? 0] ?? 'ارسال پیامک ناموفق بود. دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.';
}

export const criticalStatuses = new Set([10, 11, 13, 14, 102]);
