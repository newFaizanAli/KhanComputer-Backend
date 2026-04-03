import { CONFIG } from './constant';

const { defineConfig } = require('drizzle-kit');

if (!CONFIG.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file');
}

export default defineConfig({
    schema: './schemas/index.js', // Your schema file path
    out: './drizzle', // Your migrations folder
    dialect: 'postgresql',
    dbCredentials: {
        url: CONFIG.DATABASE_URL,
    },
});
