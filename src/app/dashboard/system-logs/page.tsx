import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { deleteLogsByAge } from "./actions"
import ExportSystemLogsButton from "./export-button"
import DeleteSystemLogsForm from "./delete-system-logs-form"
import Pagination from "../pagination"
import { normalizeForSearch } from "@/lib/search-utils"
import {
  ShieldAlert, Trash2, Package, ClipboardList, Users,
  Tags, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, ArrowRight,
  LogIn, Plus, Edit, RotateCcw, ClipboardCheck, ChevronDown
} from "lucide-react"

const PAGE_SIZE = 15

const ACTION_META: Record<string, { label: string; color: string; Icon: any }> = {
  CREATE:           { label: 'Tạo mới',       color: 'bg-green-100 text-green-800',  Icon: Plus },
  UPDATE:           { label: 'Cập nhật',       color: 'bg-blue-100 text-blue-800',   Icon: Edit },
  DELETE:           { label: 'Xóa',            color: 'bg-red-100 text-red-800',     Icon: Trash2 },
  APPROVED:         { label: 'Duyệt',          color: 'bg-emerald-100 text-emerald-800', Icon: CheckCircle2 },
  REJECTED:         { label: 'Từ chối',        color: 'bg-red-100 text-red-800',     Icon: XCircle },
  RETURNED:         { label: 'Xác nhận trả',   color: 'bg-violet-100 text-violet-800', Icon: RotateCcw },
  RETURN_REQUESTED: { label: 'Yêu cầu trả',   color: 'bg-orange-100 text-orange-800', Icon: RotateCcw },
  LOGIN:            { label: 'Đăng nhập',      color: 'bg-gray-100 text-gray-700',   Icon: LogIn },
  INVENTORY:        { label: 'Kiểm kê',        color: 'bg-purple-100 text-purple-800', Icon: ClipboardCheck },
}

const ENTITY_META: Record<string, { label: string; Icon: any }> = {
  equipment:        { label: 'Thiết bị',        Icon: Package },
  request:          { label: 'Yêu cầu mượn',   Icon: ClipboardList },
  member:           { label: 'Thành viên',      Icon: Users },
  category:         { label: 'Danh mục',        Icon: Tags },
  inventory:        { label: 'Kiểm kê',         Icon: ClipboardCheck },
}

const DELETE_OPTIONS = [
  { label: 'Trước 7 ngày',  value: '7' },
  { label: 'Trước 15 ngày', value: '15' },
  { label: 'Trước 30 ngày', value: '30' },
  { label: 'Trước 60 ngày', value: '60' },
  { label: 'Trước 90 ngày', value: '90' },
  { label: 'Xóa tất cả',    value: 'all' },
]

export default async function SystemLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; entity?: string; q?: string; userId?: string }>
}) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") redirect("/dashboard")

  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page || "1"))
  const actionFilter = sp.action || ""
  const entityFilter = sp.entity || ""
  const userIdFilter = sp.userId || ""
  const q = sp.q || ""

  const where: any = {}
  if (actionFilter) where.action = actionFilter
  if (entityFilter) where.entity = entityFilter
  if (userIdFilter) where.userId = userIdFilter
  if (q) where.searchString = { contains: normalizeForSearch(q), mode: 'insensitive' }

  const [total, logs, members] = await Promise.all([
    prisma.systemLog.count({ where }),
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true, role: true } } }
    }),
    prisma.user.findMany({
      where: { email: { not: "nguyenluyen@nsg.edu.vn" } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Build URL helper
  function buildUrl(params: Record<string, string | number>) {
    const base = new URLSearchParams({
      ...(actionFilter && { action: actionFilter }),
      ...(entityFilter && { entity: entityFilter }),
      ...(userIdFilter && { userId: userIdFilter }),
      ...(q && { q }),
      page: String(page),
    })
    Object.entries(params).forEach(([k, v]) => base.set(k, String(v)))
    return `/dashboard/system-logs?${base.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-500" /> Nhật ký Hệ thống
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng <span className="font-semibold text-gray-800">{total.toLocaleString()}</span> bản ghi
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <ExportSystemLogsButton 
            action={actionFilter} 
            entity={entityFilter} 
            q={q} 
            userId={userIdFilter} 
          />
          
          {/* Standalone delete forms for each option */}
          <DeleteSystemLogsForm />
        </div>
      </div>

      {/* Filter bar */}
      <form method="GET" className="flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Tìm trong chi tiết..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[180px]"
        />
        <select name="userId" defaultValue={userIdFilter} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs">
          <option value="">Tất cả thành viên</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name || m.email}</option>
          ))}
        </select>
        <select name="action" defaultValue={actionFilter} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả hành động</option>
          {Object.entries(ACTION_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select name="entity" defaultValue={entityFilter} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả đối tượng</option>
          {Object.entries(ENTITY_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Lọc</button>
        <a href="/dashboard/system-logs" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Xóa bộ lọc</a>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đối tượng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    Không có bản ghi nào phù hợp
                  </td>
                </tr>
              ) : logs.map((log: any) => {
                const am = ACTION_META[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600', Icon: AlertTriangle }
                const em = ENTITY_META[log.entity] || { label: log.entity, Icon: Package }
                const AIcon = am.Icon
                const EIcon = em.Icon
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {log.user ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{log.user.name || '—'}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Hệ thống</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${am.color}`}>
                        <AIcon className="w-3.5 h-3.5" />{am.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <EIcon className="w-3.5 h-3.5 text-gray-400" />{em.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-sm">
                      <p className="line-clamp-2">{log.detail}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  )
}
