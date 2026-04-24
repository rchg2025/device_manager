import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import MaintenanceActions from "../maintenance/maintenance-actions"
import Link from "next/link"
import Pagination from "../pagination"

export default async function ClassroomMaintenancePage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") {
    redirect("/dashboard")
  }

  const sp = await searchParams;
  const tab = sp?.tab || 'maintenance'; // 'maintenance' or 'broken'

  let baseWhereClause: any = { classroomEqId: { not: null } }
  
  const whereClause = tab === 'broken' 
    ? { ...baseWhereClause, status: 'BROKEN' }
    : { ...baseWhereClause, status: { not: 'BROKEN' } }

  let page = parseInt(sp?.page as string)
  if (isNaN(page) || page < 1) page = 1
  const limit = 15
  const skip = (page - 1) * limit

  const [totalMaintenances, maintenances] = await Promise.all([
    prisma.maintenance.count({ where: whereClause }),
    prisma.maintenance.findMany({
      where: whereClause,
      include: {
        classroomEq: { 
          include: { 
            area: { select: { name: true } },
            room: { include: { manager: { select: { name: true } } } } 
          } 
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(totalMaintenances / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử bảo trì Thiết bị phòng học</h2>
          <p className="text-gray-500 mt-1 text-sm">Theo dõi tình trạng và chi phí sửa chữa các thiết bị tại phòng học.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link 
          href="/dashboard/classroom-maintenance?tab=maintenance" 
          className={`py-2 px-4 text-sm font-medium border-b-2 ${tab === 'maintenance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Đang bảo trì / Sửa chữa
        </Link>
        <Link 
          href="/dashboard/classroom-maintenance?tab=broken" 
          className={`py-2 px-4 text-sm font-medium border-b-2 ${tab === 'broken' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Thiết bị hư hỏng
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vị trí & Quản lý</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả bảo trì / Lỗi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí (VNĐ)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người xử lý</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenances.map((mt: any) => (
              <tr key={mt.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {mt.classroomEq?.image ? (
                        <img 
                          src={mt.classroomEq.image.includes('drive.google.com/uc?') ? (() => { try { return `https://drive.google.com/thumbnail?id=${new URL(mt.classroomEq.image).searchParams.get('id')}&sz=w1000` } catch(e) { return mt.classroomEq.image } })() : mt.classroomEq.image} 
                          alt={mt.classroomEq.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <Wrench className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{mt.classroomEq?.name || "Đã xoá"}</div>
                      <div className="text-xs text-gray-500">
                        Số lượng xử lý: {mt.quantity}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{mt.classroomEq?.room?.name || "N/A"}</div>
                  <div className="text-xs text-gray-500">{mt.classroomEq?.area?.name || "N/A"}</div>
                  {mt.classroomEq?.room?.manager?.name && (
                    <div className="text-xs text-blue-600 mt-1">QL: {mt.classroomEq.room.manager.name}</div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={mt.description}>{mt.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mt.date ? new Date(mt.date).toLocaleDateString('vi-VN') : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                  {mt.cost ? new Intl.NumberFormat('vi-VN').format(mt.cost) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {mt.status === 'PENDING' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3"/> Chờ sửa chữa</span>}
                  {mt.status === 'IN_PROGRESS' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Wrench className="w-3 h-3"/> Đang sửa</span>}
                  {mt.status === 'COMPLETED' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Hoàn thành</span>}
                  {mt.status === 'BROKEN' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3"/> Hư hỏng</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="font-medium text-gray-900">{mt.handlerName || "-"}</div>
                  {mt.updatedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(mt.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(mt.updatedAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {session?.user?.role === "ADMIN" ? (
                    <MaintenanceActions maintenance={mt} role={session.user.role} />
                  ) : (
                    <span className="text-gray-400 text-xs italic">Không có quyền</span>
                  )}
                </td>
              </tr>
            ))}
            {maintenances.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                  Chưa có lịch sử bảo trì thiết bị phòng học nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}
