import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClassroomEqRow from "./equipment-row"
import CreateClassroomEqForm from "./create-form"
import { Upload, Plus, MonitorPlay } from "lucide-react"
import ExportExcelButton from "./export-excel-button"
import ImportExcelModal from "./import-excel-modal"
import FilterBar from "./filter-bar"
import EquipmentTable from "./equipment-table"

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

  if (session?.user?.role === "MANAGER") {
    if (whereClause.roomId) {
      whereClause.room = { id: whereClause.roomId, managerId: session.user.id }
      delete whereClause.roomId
    } else {
      whereClause.room = { managerId: session.user.id }
    }
  }

  let totalItems = 0
  let items: any[] = []
  let areas: any[] = []
  let rooms: any[] = []
  let categories: any[] = []
  let configs: any[] = []

  try {
    ;[
      totalItems,
      items,
      areas,
      rooms,
      categories,
      configs
    ] = await prisma.$transaction([
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
      prisma.room.findMany({ 
        where: session?.user?.role === "MANAGER" ? { managerId: session.user.id } : undefined,
        orderBy: { name: 'asc' } 
      }),
      prisma.classroomEqCategory.findMany({ orderBy: { name: 'asc' } }),
      prisma.deviceConfig.findMany({ orderBy: { name: 'asc' } })
    ])
  } catch (err) {
    console.error("ClassroomEquipmentsPage DB error:", err)
  }

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
        <div className="flex items-center gap-2">
          <ImportExcelModal categories={categories} areas={areas} rooms={rooms} configs={configs} />
          <ExportExcelButton data={items} />
        </div>
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
          <EquipmentTable 
            items={items}
            areas={areas}
            rooms={rooms}
            categories={categories}
            configs={configs}
            totalPages={totalPages}
            page={page}
            userRole={session?.user?.role}
          />
        </div>
      </div>
    </div>
  )
}
