import { prisma } from "@/lib/prisma"
import { createCategory, deleteCategory } from "./actions"
import { Trash2 } from "lucide-react"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { equipments: true }
      }
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh mục thiết bị</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
          <h3 className="text-lg font-semibold mb-4">Thêm danh mục mới</h3>
          <form action={async (formData) => { "use server"; await createCategory(formData) }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
              <input 
                type="text" 
                name="name" 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                placeholder="VD: Máy ảnh DSLR"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
            >
              Lưu danh mục
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng thiết bị</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat._count.equipments} loại</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async () => {
                      "use server"
                      await deleteCategory(cat.id)
                    }}>
                      <button type="submit" className="text-red-600 hover:text-red-900" title="Xóa" disabled={cat._count.equipments > 0}>
                        <Trash2 className={`w-5 h-5 ${cat._count.equipments > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Chưa có danh mục nào.
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
