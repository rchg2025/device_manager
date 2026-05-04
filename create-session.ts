import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find a manager
    const manager = await prisma.user.findFirst({
      where: { role: 'MANAGER' }
    });

    if (!manager) {
      console.log("No manager found");
      return;
    }

    const sessionToken = crypto.randomUUID();
    
    await prisma.session.create({
      data: {
        sessionToken,
        userId: manager.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
      }
    });

    console.log("SESSION_TOKEN=" + sessionToken);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
