import { prisma } from "@/lib/prisma"
import { createEquipment, deleteEquipment } from "./actions"
import { Trash2 } from "lucide-react"

export default async function EquipmentsPage() {
  const categories = await prisma.category.findMany()
  const equipments = await prisma.equipment.findMany({
    include: { category: true },
    orderBy: { category: { name: 'asc' } }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Thiết bị</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-1 h-fit">
          <h3 className="text-lg font-semibold mb-4">Thêm thiết bị mới</h3>
          <form action={async (formData) => { "use server"; await createEquipment(formData) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên thiết bị</label>
              <input 
                type="text" name="name" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="VD: Canon EOS 5D"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã vạch (Tùy chọn)</label>
              <input 
                type="text" name="barcode"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="Mã phân loại chung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Link ảnh đại diện (Tùy chọn)</label>
              <input 
                type="url" name="image"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select name="categoryId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng tổng</label>
              <input 
                type="number" name="totalQty" min="1" required defaultValue="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
              Lưu thiết bị
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thiết bị / Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng SL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sẵn sàng</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipments.map((eq: any) => (
                <tr key={eq.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {eq.image ? (
                      <img src={eq.image} alt={eq.name} className="h-10 w-10 rounded-md object-cover border border-gray-200" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                    <div className="text-sm text-gray-500">{eq.barcode || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.totalQty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.availableQty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {eq.availableQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async () => {
                      "use server"
                      await deleteEquipment(eq.id)
                    }}>
                      <button type="submit" className="text-red-600 hover:text-red-900" title="Xóa" disabled={eq.totalQty !== eq.availableQty}>
                        <Trash2 className={`w-5 h-5 ${eq.totalQty !== eq.availableQty ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {equipments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Chưa có thiết bị nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
