import { prisma } from "@/lib/prisma"
import { 
  createCategory, createUnit, createPosition,
  createArea, createRoom, createClassroomEqCategory, createDeviceConfig 
} from "./actions"
import Link from "next/link"
import CategoryRow from "./category-row"
import Pagination from "../pagination"

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const activeTab = resolvedSearchParams.tab || 'equipment'
  
  let page = parseInt((resolvedSearchParams.page as string))
  if (isNaN(page) || page < 1) page = 1
  const limit = 15
  const skip = (page - 1) * limit

  let totalItems = 0;
  let items: any[] = [];
  let allAreas: any[] = [];

  switch (activeTab) {
    case 'equipment':
      [totalItems, items] = await Promise.all([
        prisma.category.count(),
        prisma.category.findMany({ select: { id: true, name: true, _count: { select: { equipments: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'unit':
      [totalItems, items] = await Promise.all([
        prisma.unit.count(),
        prisma.unit.findMany({ select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'position':
      [totalItems, items] = await Promise.all([
        prisma.position.count(),
        prisma.position.findMany({ select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'area':
      [totalItems, items] = await Promise.all([
        prisma.area.count(),
        prisma.area.findMany({ select: { id: true, name: true, _count: { select: { rooms: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'room':
      [totalItems, items, allAreas] = await Promise.all([
        prisma.room.count(),
        prisma.room.findMany({ select: { id: true, name: true, area: { select: { id: true, name: true } }, _count: { select: { classroomEquipments: true } } }, orderBy: { name: 'asc' }, skip, take: limit }),
        prisma.area.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
      ]);
      break;
    case 'classroom-eq-cat':
      [totalItems, items] = await Promise.all([
        prisma.classroomEqCategory.count(),
        prisma.classroomEqCategory.findMany({ select: { id: true, name: true, _count: { select: { equipments: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'config':
      [totalItems, items] = await Promise.all([
        prisma.deviceConfig.count(),
        prisma.deviceConfig.findMany({ select: { id: true, name: true, _count: { select: { equipments: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    default:
      break;
  }

  const totalPages = Math.ceil(totalItems / limit) || 1

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý Danh mục chung</h2>
      </div>

      <div className="border-b border-gray-200 mb-6 overflow-x-auto pb-1 custom-scrollbar">
        <nav className="-mb-px flex space-x-6 min-w-max">
          {[
            { id: 'equipment', label: 'DM Thiết bị' },
            { id: 'unit', label: 'DM Đơn vị' },
            { id: 'position', label: 'DM Chức vụ' },
            { id: 'area', label: 'DM Khu vực' },
            { id: 'room', label: 'DM Phòng học' },
            { id: 'classroom-eq-cat', label: 'DM Thiết bị phòng' },
            { id: 'config', label: 'DM Cấu hình' }
          ].map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard/categories?tab=${tab.id}`}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === 'equipment' && (
        <CategoryTab title="Thiết bị" createAction={createCategory} data={items} totalPages={totalPages} page={page} countLabel="thiết bị" countKey="equipments" type="category" />
      )}
      {activeTab === 'unit' && (
        <CategoryTab title="Đơn vị" createAction={createUnit} data={items} totalPages={totalPages} page={page} countLabel="thành viên" countKey="users" type="unit" />
      )}
      {activeTab === 'position' && (
        <CategoryTab title="Chức vụ" createAction={createPosition} data={items} totalPages={totalPages} page={page} countLabel="thành viên" countKey="users" type="position" />
      )}
      {activeTab === 'area' && (
        <CategoryTab title="Khu vực" createAction={createArea} data={items} totalPages={totalPages} page={page} countLabel="phòng học" countKey="rooms" type="area" />
      )}
      {activeTab === 'classroom-eq-cat' && (
        <CategoryTab title="Thiết bị phòng học" createAction={createClassroomEqCategory} data={items} totalPages={totalPages} page={page} countLabel="thiết bị" countKey="equipments" type="classroomEqCategory" />
      )}
      {activeTab === 'config' && (
        <CategoryTab title="Cấu hình" createAction={createDeviceConfig} data={items} totalPages={totalPages} page={page} countLabel="thiết bị" countKey="equipments" type="deviceConfig" />
      )}
      {activeTab === 'room' && (
        <RoomTab data={items} allAreas={allAreas} totalPages={totalPages} page={page} />
      )}
    </div>
  )
}

function CategoryTab({ title, createAction, data, totalPages, page, countLabel, countKey, type }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
        <h4 className="text-lg font-semibold mb-4 border-b pb-2">Thêm {title} mới</h4>
        <form action={async (formData) => { "use server"; await createAction(formData) }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên {title.toLowerCase()}</label>
            <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" placeholder={`Nhập tên ${title.toLowerCase()}...`} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors">Thêm mới</button>
        </form>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên {title.toLowerCase()}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng {countLabel}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item: any) => (
                <CategoryRow key={item.id} item={item} countKey={countKey} type={type} />
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  )
}

function RoomTab({ data, allAreas, totalPages, page }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
        <h4 className="text-lg font-semibold mb-4 border-b pb-2">Thêm Phòng học mới</h4>
        <form action={async (formData) => { "use server"; await createRoom(formData) }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng học</label>
            <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" placeholder="VD: Phòng B1.01" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
            <select name="areaId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white">
              <option value="">-- Chọn khu vực --</option>
              {allAreas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors">Thêm mới</button>
        </form>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số thiết bị</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item: any) => (
                <CategoryRow key={item.id} item={item} countKey="classroomEquipments" type="room" extraData={{ areas: allAreas }} />
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  )
}
