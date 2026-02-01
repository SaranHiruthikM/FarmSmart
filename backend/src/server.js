import app from './app.js';
import { env, assertEnvForProd } from './config/env.js';
import { prisma } from './db/prisma.js';

assertEnvForProd();

async function start() {
  // Ensure DB connection is healthy early
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`FarmSmart backend running on http://localhost:${env.PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
