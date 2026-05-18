const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

async function main() {
  const sqlDir = path.resolve(__dirname, '..', '..', '..', 'infra', 'sql');
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const sqlPath = path.join(sqlDir, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    process.stdout.write(`Applying ${file}... `);
    await pool.query(sql);
    process.stdout.write('done\n');
  }
}

main()
  .then(() => {
    console.log('Migrations complete.');
    return pool.end();
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    pool.end().finally(() => process.exit(1));
  });

