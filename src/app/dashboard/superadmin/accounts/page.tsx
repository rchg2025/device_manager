import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SuperadminAccountsPageClient from "./client-page"

export default async function SuperadminAccountsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/dashboard")
  }

  const [accounts, units] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: ["SUPERADMIN", "SUPERVISOR"] }
      },
      include: {
        supervisedUnits: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.unit.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  return <SuperadminAccountsPageClient accounts={accounts} units={units} />
}
