import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClassroomEqRow from "./equipment-row"
import CreateClassroomEqForm from "./create-form"
import { Upload, Plus, MonitorPlay } from "lucide-react"
import ExportExcelButton from "./export-excel-button"
import Pagination from "../pagination"
import FilterBar from "./filter-bar"

export default async function ClassroomEquipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") {
    redirect("/dashboard")
  }

  const resolvedSearchParams = await searchParams
  let page = parseInt((resolvedSearchParams.page as string))
  if (isNaN(page) || page < 1) page = 1
  const limit = 15
  const skip = (page - 1) * limit
  
  const query = (resolvedSearchParams.query as string) || ""
  const areaId = (resolvedSearchParams.area as string) || ""
  const roomId = (resolvedSearchParams.room as string) || ""
  const categoryId = (resolvedSearchParams.category as string) || ""

  const whereClause: any = {}
  if (query) {
    whereClause.name = { contains: query, mode: 'insensitive' }
  }
  if (areaId) whereClause.areaId = areaId
  if (roomId) whereClause.roomId = roomId
  if (categoryId) whereClause.categoryId = categoryId

  const [
    totalItems,
    items,
    areas,
    rooms,
    categories,
    configs
  ] = await Promise.all([
    prisma.classroomEquipment.count({ where: whereClause }),
    prisma.classroomEquipment.findMany({
      where: whereClause,
      include: {
        area: true,
        room: true,
        category: true,
        configs: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.area.findMany({ orderBy: { name: 'asc' } }),
    prisma.room.findMany({ orderBy: { name: 'asc' } }),
    prisma.classroomEqCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.deviceConfig.findMany({ orderBy: { name: 'asc' } })
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-blue-600" /> Quản lý Thiết bị Phòng học
          </h2>
          <p className="text-gray-500 mt-1">Danh sách tất cả thiết bị được lắp đặt tại các phòng học</p>
        </div>
        <ExportExcelButton data={items} />
      </div>

      <FilterBar areas={areas} rooms={rooms} categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Thêm Thiết bị mới
            </h3>
            <CreateClassroomEqForm 
              areas={areas}
              rooms={rooms}
              categories={categories}
              configs={configs}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin thiết bị</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tình trạng</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item: any) => (
                    <ClassroomEqRow 
                      key={item.id} 
                      item={item} 
                      areas={areas}
                      rooms={rooms}
                      categories={categories}
                      configs={configs}
                    />
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <MonitorPlay className="w-12 h-12 mb-3 text-gray-300" />
                          <p className="text-lg font-medium text-gray-900">Chưa có thiết bị nào</p>
                          <p className="text-sm">Vui lòng thêm thiết bị mới hoặc thay đổi bộ lọc tìm kiếm.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-gray-200">
              <Pagination totalPages={totalPages} currentPage={page} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
