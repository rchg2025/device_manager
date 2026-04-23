import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const hashedPassword1 = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
      where: { email: 'admin@nsg.edu.vn' },
      update: {},
      create: {
        name: 'Quản trị viên',
        email: 'admin@nsg.edu.vn',
        password: hashedPassword1,
        role: 'ADMIN',
      },
    })
    const hashedPassword2 = await bcrypt.hash('manager123', 10)
    await prisma.user.upsert({
      where: { email: 'manager@nsg.edu.vn' },
      update: {},
      create: {
        name: 'Quản lý thiết bị',
        email: 'manager@nsg.edu.vn',
        password: hashedPassword2,
        role: 'MANAGER',
      },
    })
    const hashedPassword3 = await bcrypt.hash('member123', 10)
    await prisma.user.upsert({
      where: { email: 'member@nsg.edu.vn' },
      update: {},
      create: {
        name: 'Thành viên Test',
        email: 'member@nsg.edu.vn',
        password: hashedPassword3,
        role: 'MEMBER',
      },
    })
    console.log("Seed successful")
  } catch (e) {
    console.error(e)
  }
}

main()
