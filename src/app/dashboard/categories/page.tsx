import { prisma } from "@/lib/prisma"
import { 
  createCategory, createUnit, createPosition,
  createArea, createRoom, createClassroomEqCategory, createDeviceConfig 
} from "./actions"
import Link from "next/link"
import CategoryRow from "./category-row"
import Pagination from "../pagination"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const activeTab = (resolvedSearchParams.tab as string) || 'equipment'
  const q = (resolvedSearchParams.q as string) || ''
  const page = (resolvedSearchParams.page as string) || '1'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Quản lý Danh mục chung</h2>
        <form method="get" className="relative w-full sm:w-auto min-w-[250px]">
          <input type="hidden" name="tab" value={activeTab} />
          <input type="text" name="q" defaultValue={q} placeholder="Tìm kiếm danh mục..." className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 pl-3 pr-10 text-sm border" />
          <button type="submit" className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-50 border-l border-gray-300 rounded-r-md text-gray-500 hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </form>
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
              href={`/dashboard/categories?tab=${tab.id}${q ? `&q=${q}` : ''}`}
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

      <Suspense key={`${activeTab}-${q}-${page}`} fallback={
        <div className="flex flex-col items-center justify-center py-24 text-blue-600">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      }>
        <CategoriesDataWrapper resolvedSearchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  )
}

async function CategoriesDataWrapper({ resolvedSearchParams }: { resolvedSearchParams: any }) {
  try {
    const content = await CategoriesData({ resolvedSearchParams })
    return content
  } catch (error: any) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        <h3 className="font-bold">Đã xảy ra lỗi khi tải dữ liệu:</h3>
        <p className="mt-2 font-mono text-sm whitespace-pre-wrap">{error.message || String(error)}</p>
        <p className="mt-2 font-mono text-xs text-gray-500">{error.stack}</p>
      </div>
    )
  }
}

async function CategoriesData({ resolvedSearchParams }: { resolvedSearchParams: any }) {
  const activeTab = resolvedSearchParams.tab || 'equipment'
  
  let page = parseInt((resolvedSearchParams.page as string))
  if (isNaN(page) || page < 1) page = 1
  const limit = 15
  const skip = (page - 1) * limit
  const q = (resolvedSearchParams.q as string) || ''
  const searchFilter = q ? { name: { contains: q, mode: 'insensitive' as const } } : {}

  let totalItems = 0;
  let items: any[] = [];
  let allAreas: any[] = [];
  let managers: any[] = [];

  switch (activeTab) {
    case 'equipment':
      [totalItems, items] = await Promise.all([
        prisma.category.count({ where: searchFilter }),
        prisma.category.findMany({ where: searchFilter, select: { id: true, name: true, equipments: { select: { totalQty: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      items = items.map(item => ({ ...item, totalCount: item.equipments?.reduce((sum: number, eq: any) => sum + (eq.totalQty || 0), 0) || 0 }));
      break;
    case 'unit':
      [totalItems, items] = await Promise.all([
        prisma.unit.count({ where: searchFilter }),
        prisma.unit.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'position':
      [totalItems, items] = await Promise.all([
        prisma.position.count({ where: searchFilter }),
        prisma.position.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'area':
      [totalItems, items] = await Promise.all([
        prisma.area.count({ where: searchFilter }),
        prisma.area.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { rooms: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    case 'room':
      [totalItems, items, allAreas] = await Promise.all([
        prisma.room.count({ where: searchFilter }),
        prisma.room.findMany({ where: searchFilter, select: { id: true, name: true, area: { select: { id: true, name: true } }, classroomEquipments: { select: { name: true, quantity: true } } }, orderBy: { name: 'asc' }, skip, take: limit }),
        prisma.area.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
      ]);
      items = items.map(item => ({ ...item, totalCount: item.classroomEquipments?.reduce((sum: number, eq: any) => sum + (eq.quantity || 0), 0) || 0 }));
      break;
    case 'classroom-eq-cat':
      [totalItems, items] = await Promise.all([
        prisma.classroomEqCategory.count({ where: searchFilter }),
        prisma.classroomEqCategory.findMany({ where: searchFilter, select: { id: true, name: true, equipments: { select: { quantity: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      items = items.map(item => ({ ...item, totalCount: item.equipments?.reduce((sum: number, eq: any) => sum + (eq.quantity || 0), 0) || 0 }));
      break;
    case 'config':
      [totalItems, items] = await Promise.all([
        prisma.deviceConfig.count({ where: searchFilter }),
        prisma.deviceConfig.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { equipments: true } } }, orderBy: { name: 'asc' }, skip, take: limit })
      ]);
      break;
    default:
      break;
  }

  const totalPages = Math.ceil(totalItems / limit) || 1

  return (
    <>
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
    </>
  )
}

function CategoryTab({ title, createAction, data, managers, totalPages, page, countLabel, countKey, type }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
        <h4 className="text-lg font-semibold mb-4 border-b pb-2">Thêm {title} mới</h4>
        <form action={createAction} className="space-y-4">
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
                <CategoryRow key={item.id} item={item} countLabel={countLabel} countValue={item.totalCount !== undefined ? item.totalCount : (item._count?.[countKey] || 0)} type={type} managers={managers} />
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
        <form action={createRoom} className="space-y-4">
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
                <CategoryRow key={item.id} item={item} countLabel="thiết bị" countValue={item.totalCount !== undefined ? item.totalCount : (item._count?.classroomEquipments || 0)} type="room" extraData={{ areas: allAreas }} />
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
