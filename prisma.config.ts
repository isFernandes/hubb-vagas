import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://root:rootpassword@localhost:5432/hubb_vagas?schema=public',
  },
});
