-- Aggregates only; no IP / UA / identifiers are ever stored.

CREATE TABLE IF NOT EXISTS visits (
  country   TEXT PRIMARY KEY,   -- ISO 3166-1 alpha-2
  count     INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER
);

-- UTC daily breakdown per country ('YYYY-MM-DD')
CREATE TABLE IF NOT EXISTS visits_daily (
  day      TEXT NOT NULL,
  country  TEXT NOT NULL,
  count    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, country)
);

-- UTC daily breakdown of coarse referrer hosts (github.com / google.com / direct ...)
CREATE TABLE IF NOT EXISTS referrers_daily (
  day   TEXT NOT NULL,
  host  TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, host)
);
