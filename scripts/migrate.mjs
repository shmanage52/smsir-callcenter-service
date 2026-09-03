import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
for (const filename of (await readdir('migrations')).filter((file) => file.endsWith('.sql')).sort()) {
  const applied = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [filename]);
  if (!applied.rowCount) {
    await client.query('BEGIN');
    try { await client.query(await readFile(join('migrations', filename), 'utf8')); await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [filename]); await client.query('COMMIT'); }
    catch (error) { await client.query('ROLLBACK'); throw error; }
    console.log(`Applied ${filename}`);
  }
}
await client.end();
