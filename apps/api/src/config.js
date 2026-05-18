const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  port: Number(process.env.PORT || 4100),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/showcase_bundle',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  mediaBaseUrl: process.env.MEDIA_BASE_URL || '/media',
  mediaStorageDir: process.env.MEDIA_STORAGE_DIR || path.resolve(__dirname, '..', '..', '..', 'storage', 'media')
};

module.exports = { config };
