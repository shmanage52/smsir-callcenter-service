CREATE TABLE IF NOT EXISTS sms_topics (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  sms_template_id INTEGER NOT NULL CHECK (sms_template_id > 0),
  param_name VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sms_requests (
  id BIGSERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  recipient_name VARCHAR(160) NOT NULL,
  recipient_mobile VARCHAR(13) NOT NULL,
  topic_id INTEGER NOT NULL REFERENCES sms_topics(id),
  provider_message_id BIGINT,
  provider_status INTEGER,
  provider_message TEXT,
  cost NUMERIC(12,2),
  delivery_state SMALLINT,
  outcome VARCHAR(24) NOT NULL CHECK (outcome IN ('sent','failed','timeout')),
  error_code VARCHAR(64),
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sms_requests_delivery_poll_idx
  ON sms_requests (created_at) WHERE outcome = 'sent' AND delivery_state IS NULL;
