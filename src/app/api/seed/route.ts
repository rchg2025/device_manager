import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nsg.edu.vn' },
      update: {
        role: "ADMIN"
      },
      create: {
        email: 'admin@nsg.edu.vn',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    
    // Also create a manager and member for testing
    const managerPassword = await bcrypt.hash('manager123', 10)
    await prisma.user.upsert({
      where: { email: 'manager@nsg.edu.vn' },
      update: { role: "MANAGER" },
      create: {
        email: 'manager@nsg.edu.vn',
        name: 'Manager',
        password: managerPassword,
        role: 'MANAGER',
      },
    })

    const memberPassword = await bcrypt.hash('member123', 10)
    await prisma.user.upsert({
      where: { email: 'member@nsg.edu.vn' },
      update: { role: "MEMBER" },
      create: {
        email: 'member@nsg.edu.vn',
        name: 'Thành viên',
        password: memberPassword,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({ message: "Seed thành công", accounts: [
      { email: 'admin@nsg.edu.vn', password: 'admin123', role: 'ADMIN' },
      { email: 'manager@nsg.edu.vn', password: 'manager123', role: 'MANAGER' },
      { email: 'member@nsg.edu.vn', password: 'member123', role: 'MEMBER' },
    ] })
  } catch (error) {
    return NextResponse.json({ error: "Lỗi seed data" }, { status: 500 })
  }
}
