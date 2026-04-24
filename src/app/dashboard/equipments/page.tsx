import { prisma } from "@/lib/prisma"
import { createEquipment } from "./actions"
import EquipmentRow from "./equipment-row"
import FilterBar from "./filter-bar"
import ExportExcelButton from "./export-excel-button"

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

  const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  const equipments = await prisma.equipment.findMany({
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
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Quản lý Thiết bị</h2>
        <ExportExcelButton searchParams={{ name: nameFilter, category: categoryFilter }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-1 h-fit">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Thêm thiết bị mới</h3>
          <form action={async (formData) => { "use server"; await createEquipment(formData) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
              <input 
                type="text" name="name" required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="VD: Canon EOS 5D"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Tùy chọn)</label>
              <input 
                type="text" name="barcode"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="Mã phân loại chung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh đại diện (Tùy chọn)</label>
              <input 
                type="url" name="image"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select name="categoryId" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tổng</label>
              <input 
                type="number" name="totalQty" min="1" required defaultValue="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
              Lưu thiết bị
            </button>
          </form>
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
        </div>
      </div>
    </div>
  )
}
