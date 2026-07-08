CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT '',
  page TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#efe2c1',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
