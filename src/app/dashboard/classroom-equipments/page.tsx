import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClassroomEqRow from "./equipment-row"
import { createClassroomEquipment } from "./actions"
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
            
            <form action={async (formData) => { "use server"; await createClassroomEquipment(formData) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
                <input type="text" name="name" required placeholder="VD: Máy chiếu Panasonic" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Tùy chọn)</label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1 border border-blue-100 shadow-sm">
                        <span>Upload a file</span>
                        <input name="image" type="file" className="sr-only" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <select name="areaId" required className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn khu vực --</option>
                  {areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng học</label>
                <select name="roomId" required className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn phòng học --</option>
                  {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục thiết bị</label>
                <select name="categoryId" required className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cấu hình (Chọn nhiều)</label>
                <select name="configIds" multiple className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white h-24">
                  {configs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Giữ Ctrl (hoặc Cmd) để chọn nhiều</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                <input type="number" name="quantity" required min="1" defaultValue="1" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Thêm mới
                </button>
              </div>
            </form>
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
