// One-time backfill: mark all EXISTING users as emailVerified so nobody is
// locked out after the emailVerified column is added (new column defaults to false).
//
// Run ONLY after `npx prisma db push` on the server where DATABASE_URL is set:
//   npx tsx prisma/backfill-email-verified.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true }
  });

  console.log(`Marked ${result.count} existing user(s) as verified.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
