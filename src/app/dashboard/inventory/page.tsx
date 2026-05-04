import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { createInventorySession, completeInventorySession, deleteInventorySession, deleteInventoryRecord } from "./actions"
import ScanModal from "./scan-modal"
import { ClipboardCheck, CheckCircle2, Clock, Trash2, PlusCircle, Package, MonitorPlay, MapPin, AlertTriangle } from "lucide-react"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParams
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

  const [activeSessions, completedSessions] = await Promise.all([
    prisma.inventorySession.findMany({
      where: { status: "IN_PROGRESS" },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true } },
        _count: { select: { records: true } }
      }
    }),
    prisma.inventorySession.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        creator: { select: { name: true } },
        _count: { select: { records: true } }
      }
    })
  ])

  const activeSession = activeSessions[0]

  const records = activeSession
    ? await prisma.inventoryRecord.findMany({
        where: { sessionId: activeSession.id },
        orderBy: { createdAt: 'desc' },
        include: {
          scanner: { select: { name: true } },
          equipment: { select: { name: true, category: { select: { name: true } } } },
          classroomEq: { select: { name: true, room: { select: { name: true } }, area: { select: { name: true } } } }
        }
      })
    : []

  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    PRESENT: { label: 'Bình thường', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    DAMAGED: { label: 'Hư hỏng', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    MISSING: { label: 'Không tìm thấy', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-blue-600" /> Kiểm Kê Thiết Bị
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Quét mã QR thiết bị để ghi nhận lịch sử kiểm kê</p>
        </div>
        <div className="flex items-center gap-2">
          {activeSession && <ScanModal activeSessionId={activeSession.id} />}
        </div>
      </div>

      {/* Active Session */}
      {activeSession ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">{activeSession.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tạo bởi {activeSession.creator.name} · {new Date(activeSession.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {activeSession._count.records} lần quét
                </p>
              </div>
            </div>
            {role !== "MEMBER" && (
              <form action={async () => { "use server"; await completeInventorySession(activeSession.id) }}>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <CheckCircle2 className="w-4 h-4" /> Hoàn tất đợt này
                </button>
              </form>
            )}
          </div>

          {/* Records Table */}
          {records.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ScanModal activeSessionId={activeSession.id} />
              <p className="mt-4 text-sm">Bắt đầu quét mã QR thiết bị để ghi nhận kiểm kê</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thiết bị</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí ghi nhận</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tình trạng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người quét</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                      {role !== "MEMBER" && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {records.map((rec: any) => {
                      const name = rec.equipment?.name || rec.classroomEq?.name
                      const sub = rec.equipment
                        ? rec.equipment.category?.name
                        : `${rec.classroomEq?.room?.name} - ${rec.classroomEq?.area?.name}`
                      const isClassroom = !!rec.classroomEq
                      const s = statusMap[rec.status] || statusMap['PRESENT']
                      const SIcon = s.icon
                      return (
                        <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isClassroom ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isClassroom ? <MonitorPlay className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{name}</p>
                                <p className="text-xs text-gray-500">{sub}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{rec.location || '—'}</span>
                            </div>
                            {rec.note && <p className="text-xs text-gray-400 mt-0.5 ml-4 line-clamp-1">{rec.note}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                              <SIcon className="w-3.5 h-3.5" />{s.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{rec.scanner?.name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(rec.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </td>
                          {role !== "MEMBER" && (
                            <td className="px-4 py-3 text-right">
                              <form action={async () => { "use server"; await deleteInventoryRecord(rec.id) }}>
                                <button type="submit" className="text-red-500 hover:text-red-700 p-1" title="Xóa bản ghi">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
          <ClipboardCheck className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Chưa có đợt kiểm kê nào đang hoạt động</h3>
          <p className="text-sm text-gray-500 mb-6">Tạo một đợt kiểm kê mới để bắt đầu quét mã QR thiết bị</p>
          {role !== "MEMBER" && (
            <form action={createInventorySession} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input type="text" name="name" required placeholder="VD: Kiểm kê tháng 5/2026" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shrink-0">
                <PlusCircle className="w-4 h-4" /> Tạo đợt mới
              </button>
            </form>
          )}
        </div>
      )}

      {/* Create new session (when active exists) */}
      {activeSession && role !== "MEMBER" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Tạo đợt kiểm kê mới</h4>
          <form action={createInventorySession} className="flex gap-2">
            <input type="text" name="name" required placeholder="Tên đợt kiểm kê..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium shrink-0">
              <PlusCircle className="w-4 h-4" /> Tạo mới
            </button>
          </form>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Lịch sử các đợt đã hoàn tất
            </h3>
          </div>
          <div className="divide-y">
            {completedSessions.map((s: any) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.creator.name} · {new Date(s.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · {s._count.records} bản ghi</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoàn tất</span>
                  {role === "ADMIN" && (
                    <form action={async () => { "use server"; await deleteInventorySession(s.id) }}>
                      <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
