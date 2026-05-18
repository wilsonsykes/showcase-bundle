const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const defaultConfigFile = path.resolve(__dirname, '..', 'backend.config.json');
const configFile = process.env.BACKEND_CONFIG_FILE
  ? path.resolve(process.env.BACKEND_CONFIG_FILE)
  : defaultConfigFile;

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to read config JSON at ${filePath}: ${err.message}`);
  }
}

const fileConfig = readJson(configFile);
const fileApi = fileConfig.api || {};
const fileCors = fileApi.cors || {};
const fileDb = fileConfig.database || {};
const fileSites = fileConfig.sites || {};

function parseCsvList(v) {
  if (!v) return [];
  return String(v)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

const envCorsOrigins = parseCsvList(process.env.CORS_ORIGINS);
const fileCorsOrigins = Array.isArray(fileCors.allowOrigins) ? fileCors.allowOrigins : [];

const config = {
  port: Number(process.env.PORT || fileApi.port || 4100),
  databaseUrl:
    process.env.DATABASE_URL ||
    fileDb.connectionString ||
    'postgres://postgres:postgres@localhost:5432/showcase_bundle',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  mediaBaseUrl: process.env.MEDIA_BASE_URL || fileApi.mediaBaseUrl || '/media',
  mediaStorageDir:
    process.env.MEDIA_STORAGE_DIR ||
    fileApi.mediaStorageDir ||
    path.resolve(__dirname, '..', '..', '..', 'storage', 'media'),
  corsOrigins: envCorsOrigins.length ? envCorsOrigins : fileCorsOrigins,
  backendConfigFile: configFile,
  backendEnvironment: process.env.BACKEND_ENV || fileConfig.environment || 'local',
  sites: fileSites
};

module.exports = { config };
