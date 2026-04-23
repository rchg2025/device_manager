import { PrismaClient } from '@prisma/client'

try {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
  console.log("Success with datasources.db.url")
} catch (e) {
  console.error("Failed with datasources.db.url", e.message)
}
