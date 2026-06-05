import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role === "MEMBER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'maintenance'
    const q = searchParams.get('q') || ""
    const startDate = searchParams.get('startDate') || ""
    const endDate = searchParams.get('endDate') || ""

    let baseWhereClause: any = { equipmentId: { not: null } }
    
    let whereClause = baseWhereClause;
    if (tab === 'broken') {
      whereClause = { ...baseWhereClause, status: 'BROKEN' }
    } else if (tab === 'liquidated') {
      whereClause = { ...baseWhereClause, status: { in: ['PENDING_LIQUIDATION', 'LIQUIDATED'] } }
    } else {
      whereClause = { ...baseWhereClause, status: { notIn: ['BROKEN', 'PENDING_LIQUIDATION', 'LIQUIDATED'] } }
    }

    if (q) {
      whereClause.OR = [
        { equipment: { name: { contains: q, mode: 'insensitive' } } },
        { equipment: { barcode: { contains: q, mode: 'insensitive' } } },
        { description: { contains: q, mode: 'insensitive' } },
        { handlerName: { contains: q, mode: 'insensitive' } }
      ]
    }

    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        whereClause.date.lte = end
      }
    }

    const maintenances = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        equipment: { select: { name: true, barcode: true } }
      },
      orderBy: { date: 'desc' }
    })

    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ sửa chữa',
      'IN_PROGRESS': 'Đang sửa',
      'COMPLETED': 'Hoàn thành',
      'BROKEN': 'Hư hỏng',
      'PENDING_LIQUIDATION': 'Chờ thanh lý',
      'LIQUIDATED': 'Đã thanh lý'
    }

    const excelData = maintenances.map((mt, index) => ({
      "STT": index + 1,
      "Tên thiết bị": mt.equipment?.name || "Đã xoá",
      "Mã vạch": mt.equipment?.barcode || "",
      "Mô tả / Lỗi": mt.description,
      "Ngày ghi nhận": mt.date ? `${new Date(mt.date).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} - ${new Date(mt.date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : "",
      "Chi phí (VNĐ)": mt.cost || 0,
      "Trạng thái": statusMap[mt.status] || mt.status,
      "Người xử lý": mt.handlerName || "",
      "Số lượng": mt.quantity,
      "Ngày cập nhật": mt.updatedAt ? `${new Date(mt.updatedAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} - ${new Date(mt.updatedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "LichSuBaoTriKho")

    const wscols = [
      { wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 40 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, 
      { wch: 10 }, { wch: 15 }
    ]
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="LichSuBaoTri_Kho_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
