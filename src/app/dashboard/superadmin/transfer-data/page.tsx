import { basePrisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TransferClient from "./transfer-client"

export default async function TransferDataPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/dashboard")
  }

  // Lấy danh sách tất cả các đơn vị
  const units = await basePrisma.unit.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          users: true,
          categories: true,
          equipments: true,
          borrowRequests: true,
          inventorySessions: true
        }
      }
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Điều chuyển Dữ liệu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chuyển đổi dữ liệu (Danh mục, Thiết bị, Người dùng,...) từ đơn vị này sang đơn vị khác. 
          Công cụ này rất hữu ích khi bạn muốn phân bổ dữ liệu từ Đơn vị gốc về các khoa/chi nhánh cụ thể.
        </p>
      </div>

      <TransferClient units={units} />
    </div>
  )
}
