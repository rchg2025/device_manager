import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const session = { user: { role: 'MANAGER', id: 'test-manager-id' } };
    
    const whereClause: any = {};
    whereClause.roomId = "some-room-id";
    // Simulate what page.tsx does
    if (whereClause.roomId) {
      whereClause.room = { id: whereClause.roomId, managerId: session.user.id }
      delete whereClause.roomId
    } else {
      whereClause.room = { managerId: session.user.id }
    }

    console.log("Testing Prisma query with roomId...");
    const res = await prisma.classroomEquipment.findMany({
      where: whereClause,
      include: {
        area: true,
        room: true,
        category: true,
        configs: true
      },
      take: 1
    });
    console.log("Success! Found:", res.length);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
