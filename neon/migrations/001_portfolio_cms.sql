-- Run in NEON SQL Editor for a dedicated Neon project.
-- Database credentials are used ONLY by the Next.js server. Do not enable a public Data API.
-- A verified Neon Auth session and server-side email allowlist protect admin writes.

CREATE TABLE IF NOT EXISTS portfolio_admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_admins_normalized CHECK (email = lower(trim(email)))
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  number TEXT NOT NULL DEFAULT '00',
  title TEXT NOT NULL,
  display_title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  scene TEXT NOT NULL DEFAULT 'abstract',
  summary TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  github TEXT,
  live TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 100,
  seo_title TEXT,
  seo_description TEXT,
  architecture JSONB NOT NULL DEFAULT '[]'::jsonb,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenge_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolio_projects_published_position ON portfolio_projects(published,position,created_at);
CREATE TABLE IF NOT EXISTS portfolio_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION portfolio_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at=now();RETURN NEW;END $$;
DROP TRIGGER IF EXISTS portfolio_projects_updated_at ON portfolio_projects;
CREATE TRIGGER portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects FOR EACH ROW EXECUTE FUNCTION portfolio_set_updated_at();
DROP TRIGGER IF EXISTS portfolio_settings_updated_at ON portfolio_settings;
CREATE TRIGGER portfolio_settings_updated_at BEFORE UPDATE ON portfolio_settings FOR EACH ROW EXECUTE FUNCTION portfolio_set_updated_at();

-- After enabling Neon Auth and signing up with YOUR email, add ONLY that email:
-- INSERT INTO portfolio_admins(email) VALUES ('you@example.com') ON CONFLICT DO NOTHING;
-- ALSO set NEON_ADMIN_EMAIL to the same email in .env.local.
