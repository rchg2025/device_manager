import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const actionFilter = searchParams.get("action") || ""
    const entityFilter = searchParams.get("entity") || ""
    const q = searchParams.get("q") || ""
    const userId = searchParams.get("userId") || ""

    const where: any = {}
    if (actionFilter) where.action = actionFilter
    if (entityFilter) where.entity = entityFilter
    if (q) where.detail = { contains: q, mode: 'insensitive' }
    if (userId) where.userId = userId

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, role: true } } }
    })

    const ACTION_META: Record<string, string> = {
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      APPROVED: 'Duyệt',
      REJECTED: 'Từ chối',
      RETURNED: 'Xác nhận trả',
      RETURN_REQUESTED: 'Yêu cầu trả',
      LOGIN: 'Đăng nhập',
      INVENTORY: 'Kiểm kê',
    }

    const ENTITY_META: Record<string, string> = {
      equipment: 'Thiết bị',
      request: 'Yêu cầu mượn',
      member: 'Thành viên',
      category: 'Danh mục',
      inventory: 'Kiểm kê',
    }

    const excelData = logs.map((log, index) => ({
      "STT": index + 1,
      "Thời gian": new Date(log.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Người thực hiện": log.user ? (log.user.name || log.user.email) : "Hệ thống",
      "Email": log.user?.email || "",
      "Hành động": ACTION_META[log.action] || log.action,
      "Đối tượng": ENTITY_META[log.entity] || log.entity,
      "Chi tiết": log.detail
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "NhatKyHeThong")

    // Căn chỉnh độ rộng cột
    const wscols = [
      { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 60 }
    ]
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="NhatKyHeThong_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
