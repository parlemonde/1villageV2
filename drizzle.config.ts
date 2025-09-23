import { defineConfig } from 'drizzle-kit';

import { getEnvVariable } from './src/server/lib/get-env-variable';

export default defineConfig({
    schema: './src/server/database/schemas/*.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: getEnvVariable('DATABASE_URL'),
    },
});
