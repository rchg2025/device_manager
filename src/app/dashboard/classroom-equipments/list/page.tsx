import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MonitorPlay, Tag } from "lucide-react"
import FilterBar from "./filter-bar"
import ExportExcelButton from "./export-excel-button"
import ExportQRCodeButton from "./export-qrcode-button"
import Pagination from "../../pagination"

export default async function ClassroomEquipmentsListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  const role = session?.user?.role

  if (role === "MEMBER") {
    redirect("/dashboard")
  }

  const resolvedSearchParams = await searchParams
  let page = parseInt((resolvedSearchParams.page as string))
  if (isNaN(page) || page < 1) page = 1
  const limit = 20
  const skip = (page - 1) * limit
  
  const roomQuery = (resolvedSearchParams.room as string) || ""
  const managerQuery = (resolvedSearchParams.manager as string) || ""
  const equipmentQuery = (resolvedSearchParams.equipment as string) || ""

  const whereClause: any = {}
  
  if (roomQuery) {
    whereClause.name = { contains: roomQuery, mode: 'insensitive' }
  }
  
  if (managerQuery) {
    whereClause.manager = { name: { contains: managerQuery, mode: 'insensitive' } }
  }
  
  if (equipmentQuery) {
    whereClause.classroomEquipments = { some: { name: { contains: equipmentQuery, mode: 'insensitive' } } }
  }

  // Permissions restriction
  if (role === "MANAGER") {
    whereClause.managerId = session?.user?.id
  }

  const [totalItems, rooms] = await prisma.$transaction([
    prisma.room.count({ where: whereClause }),
    prisma.room.findMany({
      where: whereClause,
      include: {
        area: true,
        manager: { select: { id: true, name: true } },
        classroomEquipments: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: [
        { area: { name: 'asc' } },
        { name: 'asc' }
      ],
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-blue-600" /> Danh sách thiết bị
          </h2>
          <p className="text-gray-500 mt-1">Tổng hợp và thống kê thiết bị theo từng phòng học</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportQRCodeButton />
          <ExportExcelButton />
        </div>
      </div>

      <FilterBar />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Tên Phòng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Khu Vực</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[60%]">Số Thiết Bị</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => {
                const totalEq = room.classroomEquipments.reduce((sum: number, eq: any) => sum + eq.quantity, 0)
                
                return (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-800">{room.name}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-700">{room.area?.name || "Chưa có khu vực"}</div>
                      <div className="text-sm text-blue-600 mt-1">QL: {room.manager?.name || "Chưa chỉ định"}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-gray-800 mb-2">{totalEq} thiết bị</div>
                      <div className="flex flex-wrap gap-2">
                        {room.classroomEquipments.map((eq: any) => (
                          <span key={eq.id} className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
                            {eq.name}
                            <span className="ml-1 text-gray-400">x{eq.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <MonitorPlay className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">Không tìm thấy phòng nào</p>
                      <p className="text-sm">Vui lòng thay đổi bộ lọc tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-gray-200">
            <Pagination totalPages={totalPages} currentPage={page} />
          </div>
        )}
      </div>
    </div>
  )
}
