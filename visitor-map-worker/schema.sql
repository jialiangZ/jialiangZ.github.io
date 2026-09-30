CREATE TABLE IF NOT EXISTS visits (
  country   TEXT PRIMARY KEY,
  count     INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER
);
