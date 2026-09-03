# SMS.ir Call-center Notification Service

سرویس REST بک‌اند برای ارسال پیامک الگوی sms.ir از فرم بک‌آفیس. کلید API فقط روی سرور نگه‌داری می‌شود؛ هر ارسال، موفق یا ناموفق، در PostgreSQL ثبت می‌شود.

## قابلیت‌ها

- `POST /v1/sms-requests` با اعتبارسنجی شماره‌های `09xxxxxxxxx` و `+989xxxxxxxxx`
- ارسال Verify به `POST /v1/send/verify` با `templateId` و نام پارامتر پیکربندی‌شده برای هر موضوع
- ثبت کامل نتیجهٔ سرویس، شناسهٔ پیام، هزینه، خطا و timeout در `sms_requests`
- پیام قابل‌فهم برای خطاهای 102، 113 و 115؛ وبهوک هشدار برای خطاهای critical
- timeout پنج‌ثانیه‌ای، rate limiting، هدرهای امنیتی، Docker و migration قابل تکرار

## اجرای محلی

```bash
cp .env.example .env
# مقدار SMSIR_API_KEY را در .env وارد کنید
docker compose up --build
docker compose exec api npm run db:migrate
```

موضوع‌ها باید پیش از ارسال در دیتابیس ثبت شوند. نمونه:

```sql
INSERT INTO sms_topics (title, url, sms_template_id, param_name)
VALUES ('نزدیک‌ترین نمایندگی', 'https://go.example/r', 100000, 'LINK');
```

> sms.ir برای مقدار پارامتر Pattern سقف ۲۵ کاراکتر اعلام کرده است. URL‌های بلند را با redirect کوتاه داخلی یا shortener موردتأیید کسب‌وکار جایگزین کنید.

## API

```http
POST /v1/sms-requests
Content-Type: application/json

{ "agent_id": 42, "name": "مریم احمدی", "mobile": "+989121234567", "topic_id": 1 }
```

پاسخ موفق `201` است. خطاهای اعتبارسنجی `400`، موضوع غیرفعال `404`، خطای پاسخ sms.ir `422` و timeout/اختلال شبکه `503` هستند. `GET /health` برای health check کانتینر موجود است.

## آماده‌سازی پیش از Production

1. برای هر موضوع، Pattern تاییدشده بسازید و `templateId` و نام دقیق پارامتر آن را ثبت کنید.
2. `SMSIR_API_KEY` را در secret manager یا environment سرویس قرار دهید؛ هرگز در Git ثبت نکنید.
3. برای خطاهای critical، `ALERT_WEBHOOK_URL` را به Slack/monitoring سازمان وصل کنید.
4. یک short URL پایدار برای هر لینک در `sms_topics.url` قرار دهید.

## توسعه و تست

```bash
npm install
npm run db:migrate
npm test
npm run build
```

این پیاده‌سازی عمداً delivery polling را فعال نمی‌کند، چون endpoint و معنای `delivery_state` باید با مستندات و قرارداد حساب sms.ir شما تأیید شود. ساختار جدول و `provider_message_id` برای افزودن worker آماده است.
