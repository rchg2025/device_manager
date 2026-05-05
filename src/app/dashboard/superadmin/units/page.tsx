import { basePrisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import UnitsClient from "./units-client"

export default async function SuperAdminUnitsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/dashboard")
  }

  // Use basePrisma to fetch all units across the system
  const units = await basePrisma.unit.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          users: true,
          equipments: true,
          borrowRequests: true
        }
      }
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn vị (Tenant)</h1>
          <p className="text-sm text-gray-500 mt-1">Dành riêng cho SUPERADMIN. Tạo và quản lý các chi nhánh/đơn vị trong hệ thống.</p>
        </div>
      </div>

      <UnitsClient initialUnits={units} />
    </div>
  )
}
