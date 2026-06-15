import { PrismaClient } from '@prisma/client';
import { normalizeForSearch, generateSearchString } from '../src/lib/search-utils';

const prisma = new PrismaClient();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("Starting to sync search fields...");

  // Update Categories
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    if (!c.nameSearch) {
      await prisma.category.update({
        where: { id: c.id },
        data: { nameSearch: normalizeForSearch(c.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${categories.length} categories.`);

  // Update Departments
  const departments = await prisma.department.findMany();
  for (const d of departments) {
    if (!d.nameSearch) {
      await prisma.department.update({
        where: { id: d.id },
        data: { nameSearch: normalizeForSearch(d.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${departments.length} departments.`);

  // Update Positions
  const positions = await prisma.position.findMany();
  for (const p of positions) {
    if (!p.nameSearch) {
      await prisma.position.update({
        where: { id: p.id },
        data: { nameSearch: normalizeForSearch(p.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${positions.length} positions.`);

  // Update Areas
  const areas = await prisma.area.findMany();
  for (const a of areas) {
    if (!a.nameSearch) {
      await prisma.area.update({
        where: { id: a.id },
        data: { nameSearch: normalizeForSearch(a.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${areas.length} areas.`);

  // Update Rooms
  const rooms = await prisma.room.findMany();
  for (const r of rooms) {
    if (!r.nameSearch) {
      await prisma.room.update({
        where: { id: r.id },
        data: { nameSearch: normalizeForSearch(r.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${rooms.length} rooms.`);

  // Update Units
  const units = await prisma.unit.findMany();
  for (const u of units) {
    if (!u.nameSearch) {
      await prisma.unit.update({
        where: { id: u.id },
        data: { nameSearch: normalizeForSearch(u.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${units.length} units.`);

  // Update ClassroomEqCategory
  const ceqCategories = await prisma.classroomEqCategory.findMany();
  for (const c of ceqCategories) {
    if (!c.nameSearch) {
      await prisma.classroomEqCategory.update({
        where: { id: c.id },
        data: { nameSearch: normalizeForSearch(c.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${ceqCategories.length} classroom equipment categories.`);

  // Update DeviceConfig
  const deviceConfigs = await prisma.deviceConfig.findMany();
  for (const c of deviceConfigs) {
    if (!c.nameSearch) {
      await prisma.deviceConfig.update({
        where: { id: c.id },
        data: { nameSearch: normalizeForSearch(c.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${deviceConfigs.length} device configs.`);

  // Update Equipments
  const equipments = await prisma.equipment.findMany();
  for (const e of equipments) {
    if (!e.nameSearch) {
      await prisma.equipment.update({
        where: { id: e.id },
        data: { nameSearch: normalizeForSearch(e.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${equipments.length} equipments.`);

  // Update ClassroomEquipments
  const classroomEqs = await prisma.classroomEquipment.findMany();
  for (const e of classroomEqs) {
    if (!e.nameSearch) {
      await prisma.classroomEquipment.update({
        where: { id: e.id },
        data: { nameSearch: normalizeForSearch(e.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${classroomEqs.length} classroom equipments.`);

  // Update Users
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (!u.nameSearch) {
      await prisma.user.update({
        where: { id: u.id },
        data: { nameSearch: normalizeForSearch(u.name || '') }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${users.length} users.`);

  // Update Inventory Sessions
  const sessions = await prisma.inventorySession.findMany();
  for (const s of sessions) {
    if (!s.nameSearch) {
      await prisma.inventorySession.update({
        where: { id: s.id },
        data: { nameSearch: normalizeForSearch(s.name) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${sessions.length} inventory sessions.`);

  // Update Maintenance
  const maintenances = await prisma.maintenance.findMany();
  for (const m of maintenances) {
    if (!m.searchString) {
      await prisma.maintenance.update({
        where: { id: m.id },
        data: { searchString: generateSearchString(m.description, m.handlerName) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${maintenances.length} maintenance records.`);

  // Update SystemLogs
  const logs = await prisma.systemLog.findMany();
  for (const l of logs) {
    if (!l.searchString) {
      await prisma.systemLog.update({
        where: { id: l.id },
        data: { searchString: generateSearchString(l.action, l.detail) }
      });
      await delay(50);
    }
  }
  console.log(`Updated ${logs.length} system logs.`);

  console.log("Sync complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
