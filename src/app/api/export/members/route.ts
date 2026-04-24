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

    const members = await prisma.user.findMany({
      include: {
        unit: { select: { name: true } },
        position: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const excelData = members.map((user, index) => ({
      "STT": index + 1,
      "Họ và tên": user.name || "",
      "Email": user.email || "",
      "Số điện thoại": user.phone || "",
      "Đơn vị": user.unit?.name || "",
      "Chức vụ": user.position?.name || "",
      "Vai trò": 
        user.role === 'ADMIN' ? 'Quản trị viên' :
        user.role === 'MANAGER' ? 'Quản lý' : 'Thành viên',
      "Ngày tạo": new Date(user.createdAt).toLocaleDateString('vi-VN')
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachThanhVien")

    const wscols = [
      { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, 
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ]
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="DanhSachThanhVien_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
