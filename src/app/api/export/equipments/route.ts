import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const nameFilter = searchParams.get('name') || ""
    const categoryFilter = searchParams.get('category') || ""

    const whereClause: any = {}
    if (nameFilter) {
      whereClause.OR = [
        { name: { contains: nameFilter, mode: 'insensitive' } },
        { barcode: { contains: nameFilter, mode: 'insensitive' } }
      ]
    }
    if (categoryFilter) {
      whereClause.categoryId = categoryFilter
    }

    const equipments = await prisma.equipment.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const excelData = equipments.map((eq, index) => ({
      "STT": index + 1,
      "Tên thiết bị": eq.name,
      "Mã vạch": eq.barcode || "",
      "Danh mục": eq.category.name,
      "Tổng số lượng": eq.totalQty,
      "Sẵn sàng": eq.availableQty,
      "Đang cho mượn / Bảo trì": eq.totalQty - eq.availableQty,
      "Người thêm": eq.creatorName || "",
      "Ngày thêm": new Date(eq.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachThietBi")

    const wscols = [
      { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, 
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 15 }
    ]
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="DanhSachThietBi_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
