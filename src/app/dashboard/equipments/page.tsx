import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { createEquipment } from "./actions"
import EquipmentRow from "./equipment-row"
import CreateEquipmentForm from "./create-form"
import FilterBar from "./filter-bar"
import ExportExcelButton from "./export-excel-button"
import Pagination from "../pagination"

export default async function EquipmentsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const sp = await searchParams;
  const nameFilter = sp?.name || ""
  const categoryFilter = sp?.category || ""

  const whereClause: any = {}
  if (nameFilter) {
    whereClause.OR = [
      { name: { contains: nameFilter, mode: 'insensitive' } },
      { barcode: { contains: nameFilter, mode: 'insensitive' } }
    ]
  }
  if (categoryFilter) {
    whereClause.categoryId = categoryFilter
  }

  const session = await auth()
  const role = session?.user?.role
  const userId = session?.user?.id

  let categoryWhere: any = {}
  if (role === 'MANAGER') {
    categoryWhere = {
      OR: [
        { managerId: null },
        { managerId: userId }
      ]
    }
    // Also restrict equipments to those categories
    whereClause.category = categoryWhere
  }

  let page = parseInt(sp?.page as string)
  if (isNaN(page) || page < 1) page = 1
  const limit = 15
  const skip = (page - 1) * limit

  const categories = await prisma.category.findMany({ where: categoryWhere, select: { id: true, name: true }, orderBy: { name: 'asc' } })
  const [totalEquipments, equipments] = await Promise.all([
    prisma.equipment.count({ where: whereClause }),
    prisma.equipment.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        barcode: true,
        image: true,
        totalQty: true,
        availableQty: true,
        categoryId: true,
        category: { select: { name: true } },
        createdAt: true,
        creatorName: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(totalEquipments / limit)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Quản lý Thiết bị</h2>
        <ExportExcelButton searchParams={{ name: nameFilter, category: categoryFilter }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-1 h-fit">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Thêm thiết bị mới</h3>
          <CreateEquipmentForm categories={categories} />
        </div>

        <div className="col-span-1 md:col-span-3">
          <FilterBar categories={categories} />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thiết bị / Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người / Ngày thêm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng SL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sẵn sàng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipments.map((eq: any) => (
                  <EquipmentRow key={eq.id} eq={eq} categories={categories} />
                ))}
                {equipments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                      Không tìm thấy thiết bị nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  )
}
