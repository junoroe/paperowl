-- PaperOwl Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company_name VARCHAR(255),
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'business')),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  template_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  legal_text TEXT NOT NULL,
  intro_text TEXT,
  thank_you_text TEXT,
  has_minor_flow BOOLEAN DEFAULT false,
  branding_color VARCHAR(7),
  notify_email BOOLEAN DEFAULT true,
  webhook_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_fields (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'email', 'number', 'phone', 'date', 'checkbox', 'signature')),
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  conditional_group VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'adult' CHECK (type IN ('adult', 'minor')),
  status VARCHAR(50) DEFAULT 'completed',
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  subject_name VARCHAR(255),
  minor_age INTEGER,
  responses JSONB,
  signature_url TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tracking_params JSONB
);

CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_signer_email ON submissions(signer_email);
CREATE INDEX idx_submissions_signed_at ON submissions(signed_at);
