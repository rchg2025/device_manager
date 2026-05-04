const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const count = await prisma.systemLog.count();
  console.log("Total logs before:", count);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 15);
  console.log("Cutoff date:", cutoff);
  
  const deleted = await prisma.systemLog.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });
  console.log("Deleted old logs:", deleted);

  const countAfter = await prisma.systemLog.count();
  console.log("Total logs after:", countAfter);
}
test().catch(console.error).finally(() => prisma.$disconnect());
