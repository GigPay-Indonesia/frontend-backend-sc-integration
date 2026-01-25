import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const direct = process.env.DIRECT_DATABASE_URL || process.env.DIRECT_URL;
const accelerate = process.env.DATABASE_URL;

if (!accelerate) {
    throw new Error('Missing DATABASE_URL');
}
if (!direct) {
    throw new Error('Missing DIRECT_DATABASE_URL');
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: direct,
    },
});
