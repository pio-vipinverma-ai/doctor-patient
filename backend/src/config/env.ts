import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  LOG_LEVEL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue || '';
};

const config: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/doc_patient_db'),
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: parseInt(getEnvVar('DB_PORT', '5432'), 10),
  DB_NAME: getEnvVar('DB_NAME', 'doc_patient_db'),
  DB_USER: getEnvVar('DB_USER', 'postgres'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', 'postgres'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRATION: getEnvVar('JWT_EXPIRATION', '8h'),
  JWT_REFRESH_EXPIRATION: getEnvVar('JWT_REFRESH_EXPIRATION', '24h'),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
};

export default config;
