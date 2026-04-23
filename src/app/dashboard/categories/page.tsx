import { prisma } from "@/lib/prisma"
import { createCategory, deleteCategory, createUnit, deleteUnit, createPosition, deletePosition } from "./actions"
import { Trash2 } from "lucide-react"
import Link from "next/link"

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const activeTab = searchParams.tab || 'equipment'

  const [categories, units, positions] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { equipments: true } } } }),
    prisma.unit.findMany({ include: { _count: { select: { users: true } } } }),
    prisma.position.findMany({ include: { _count: { select: { users: true } } } })
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Danh mục chung</h2>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="?tab=equipment"
            className={`${
              activeTab === 'equipment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Danh mục Thiết bị
          </Link>
          <Link
            href="?tab=unit"
            className={`${
              activeTab === 'unit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Danh mục Đơn vị
          </Link>
          <Link
            href="?tab=position"
            className={`${
              activeTab === 'position'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Danh mục Chức vụ
          </Link>
        </nav>
      </div>

      {/* Tab Content: Equipment */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
            <h4 className="text-lg font-semibold mb-4">Thêm danh mục thiết bị</h4>
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
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Lưu
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng thiết bị</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat: any) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat._count.equipments} loại</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async () => { "use server"; await deleteCategory(cat.id) }}>
                        <button type="submit" className="text-red-600 hover:text-red-900" title="Xóa" disabled={cat._count.equipments > 0}>
                          <Trash2 className={`w-5 h-5 ${cat._count.equipments > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có danh mục nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Unit */}
      {activeTab === 'unit' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
            <h4 className="text-lg font-semibold mb-4">Thêm Đơn vị mới</h4>
            <form action={async (formData) => { "use server"; await createUnit(formData) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên đơn vị</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                  placeholder="VD: Khoa CNTT"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Lưu
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Đơn vị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số thành viên</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {units.map((unit: any) => (
                  <tr key={unit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit._count.users} người</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async () => { "use server"; await deleteUnit(unit.id) }}>
                        <button type="submit" className="text-red-600 hover:text-red-900" title="Xóa" disabled={unit._count.users > 0}>
                          <Trash2 className={`w-5 h-5 ${unit._count.users > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có đơn vị nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Position */}
      {activeTab === 'position' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
            <h4 className="text-lg font-semibold mb-4">Thêm Chức vụ mới</h4>
            <form action={async (formData) => { "use server"; await createPosition(formData) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên chức vụ</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                  placeholder="VD: Giảng viên"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                Lưu
              </button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Chức vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số thành viên</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((pos: any) => (
                  <tr key={pos.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pos.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pos._count.users} người</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async () => { "use server"; await deletePosition(pos.id) }}>
                        <button type="submit" className="text-red-600 hover:text-red-900" title="Xóa" disabled={pos._count.users > 0}>
                          <Trash2 className={`w-5 h-5 ${pos._count.users > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có chức vụ nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
