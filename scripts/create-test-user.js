const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = "test_debug@nsg.edu.vn"
  const password = await bcrypt.hash("123456", 10)
  
  await prisma.user.upsert({
    where: { email },
    update: { password, role: "ADMIN" },
    create: {
      email,
      name: "Test Debug",
      password,
      role: "ADMIN"
    }
  })
  
  console.log("Test user created!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
