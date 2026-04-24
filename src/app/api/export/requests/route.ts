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
    const filter = searchParams.get('filter')

    let whereClause: any = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === 'action_required') {
      whereClause.status = { in: ['PENDING', 'RETURN_REQUESTED'] }
    } else if (filter === 'overdue') {
      whereClause.status = 'APPROVED'
      whereClause.returnDate = { lt: today }
    }

    const requests = await prisma.borrowRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, unit: { select: { name: true } } } },
        equipment: { select: { name: true, category: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Prepare data for Excel
    const excelData = requests.map((req, index) => ({
      "STT": index + 1,
      "Người mượn": req.user.name || req.user.email,
      "Đơn vị": req.user.unit?.name || "",
      "Thiết bị": req.equipment.name,
      "Danh mục": req.equipment.category.name,
      "Số lượng": req.quantity,
      "Trạng thái": 
        req.status === 'PENDING' ? 'Chờ duyệt' :
        req.status === 'APPROVED' ? 'Đang mượn' :
        req.status === 'RETURN_REQUESTED' ? 'Chờ nhận trả' :
        req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối',
      "Ngày tạo yêu cầu": new Date(req.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Ngày mượn": new Date(req.borrowDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Hẹn trả": new Date(req.returnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Ngày trả thực tế": req.actualReturnDate ? new Date(req.actualReturnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : "",
      "Tình trạng khi trả": req.returnCondition || "",
      "Lý do từ chối": req.rejectionReason || "",
      "Người duyệt/nhận": req.reviewerName || req.returnReviewerName || ""
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "LichSuMuonTra")

    // Căn chỉnh độ rộng cột
    const wscols = [
      { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, 
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ]
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="BaoCao_MuonTra_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
