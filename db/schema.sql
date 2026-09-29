-- Researchette database (Cloudflare D1)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT DEFAULT '',
  pw_hash TEXT NOT NULL,
  pw_salt TEXT NOT NULL,
  college TEXT DEFAULT '',
  level TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  title TEXT DEFAULT '',
  tracks TEXT DEFAULT '["original"]',
  active_track TEXT DEFAULT 'original',
  mentor_id TEXT,
  active INTEGER DEFAULT 1,
  joined TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  track TEXT NOT NULL,
  step INTEGER NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL,
  feedback TEXT,
  reviewer_id TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS submissions_user ON submissions (user_id, track, step);
CREATE INDEX IF NOT EXISTS submissions_status ON submissions (status);
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  college TEXT DEFAULT '',
  level TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  goals TEXT DEFAULT '[]',
  why TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  paid INTEGER DEFAULT 0,
  user_id TEXT
);

-- Created automatically by the worker on first use (listed here for reference).
CREATE TABLE IF NOT EXISTS activity (id TEXT PRIMARY KEY, type TEXT NOT NULL, summary TEXT NOT NULL, detail TEXT DEFAULT '', member_id TEXT, actor_id TEXT, link TEXT DEFAULT '', created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS activity_time ON activity (created_at);
CREATE TABLE IF NOT EXISTS oauth_clients (client_id TEXT PRIMARY KEY, secret_hash TEXT, name TEXT, redirect_uris TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS oauth_codes (code_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, user_id TEXT NOT NULL, redirect_uri TEXT NOT NULL, challenge TEXT NOT NULL, scope TEXT, resource TEXT, expires TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS oauth_tokens (token_hash TEXT PRIMARY KEY, kind TEXT NOT NULL, client_id TEXT NOT NULL, user_id TEXT NOT NULL, scope TEXT, resource TEXT, expires TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS oauth_tokens_user ON oauth_tokens (user_id, client_id);
