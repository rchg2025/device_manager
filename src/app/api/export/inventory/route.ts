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
    const sessionId = searchParams.get("sessionId") || undefined

    const where: any = sessionId ? { sessionId } : {}

    const records = await prisma.inventoryRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        scanner: { select: { name: true, email: true } },
        equipment: {
          select: {
            name: true,
            category: { select: { name: true, manager: { select: { name: true } } } }
          }
        },
        classroomEq: {
          select: {
            name: true,
            room: { select: { name: true } },
            area: { select: { name: true } }
          }
        },
        session: { select: { name: true } }
      }
    })

    const statusLabel = (s: string) =>
      s === "PRESENT" ? "Bình thường" : s === "DAMAGED" ? "Hư hỏng" : "Không tìm thấy"

    // ── Sheet 1: Chi tiết ─────────────────────────────────────────
    const detailData = records.map((rec: any, i: number) => {
      const isClassroom = !!rec.classroomEq
      return {
        "STT": i + 1,
        "Đợt kiểm kê": rec.session?.name || "Không thuộc đợt nào",
        "Loại thiết bị": isClassroom ? "Thiết bị phòng học" : "Thiết bị chung",
        "Tên thiết bị": isClassroom ? rec.classroomEq?.name : rec.equipment?.name,
        "Danh mục / Phòng": isClassroom
          ? `${rec.classroomEq?.room?.name || ""} - ${rec.classroomEq?.area?.name || ""}`
          : rec.equipment?.category?.name || "",
        "NV Phụ trách DM": isClassroom ? "" : (rec.equipment?.category?.manager?.name || "Chưa có"),
        "Vị trí ghi nhận": rec.location || "",
        "Tình trạng": statusLabel(rec.status),
        "Ghi chú": rec.note || "",
        "Người quét": rec.scanner?.name || rec.scanner?.email || "",
        "Thời gian quét": new Date(rec.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      }
    })

    // ── Sheet 2: Thống kê theo Phòng ─────────────────────────────
    const byRoom: Record<string, { total: number; present: number; damaged: number; missing: number }> = {}
    for (const rec of records) {
      const isClassroom = !!rec.classroomEq
      const roomKey = isClassroom
        ? `${rec.classroomEq?.room?.name || "?"} (${rec.classroomEq?.area?.name || "?"})`
        : `Kho chung (${(rec as any).equipment?.category?.name || "?"})`
      if (!byRoom[roomKey]) byRoom[roomKey] = { total: 0, present: 0, damaged: 0, missing: 0 }
      byRoom[roomKey].total++
      if (rec.status === "PRESENT") byRoom[roomKey].present++
      else if (rec.status === "DAMAGED") byRoom[roomKey].damaged++
      else byRoom[roomKey].missing++
    }
    const byRoomData = Object.entries(byRoom).map(([room, stats], i) => ({
      "STT": i + 1,
      "Phòng / Khu vực": room,
      "Tổng số lần quét": stats.total,
      "Bình thường": stats.present,
      "Hư hỏng": stats.damaged,
      "Không tìm thấy": stats.missing
    }))

    // ── Sheet 3: Thống kê theo Thiết bị ──────────────────────────
    const byDevice: Record<string, { total: number; present: number; damaged: number; missing: number }> = {}
    for (const rec of records) {
      const name = (rec as any).equipment?.name || (rec as any).classroomEq?.name || "Không rõ"
      if (!byDevice[name]) byDevice[name] = { total: 0, present: 0, damaged: 0, missing: 0 }
      byDevice[name].total++
      if (rec.status === "PRESENT") byDevice[name].present++
      else if (rec.status === "DAMAGED") byDevice[name].damaged++
      else byDevice[name].missing++
    }
    const byDeviceData = Object.entries(byDevice)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([device, stats], i) => ({
        "STT": i + 1,
        "Tên thiết bị": device,
        "Tổng số lần quét": stats.total,
        "Bình thường": stats.present,
        "Hư hỏng": stats.damaged,
        "Không tìm thấy": stats.missing
      }))

    // ── Sheet 4: Thống kê theo Nhân viên quét ────────────────────
    const byScanner: Record<string, { total: number; present: number; damaged: number; missing: number }> = {}
    for (const rec of records) {
      const name = (rec as any).scanner?.name || (rec as any).scanner?.email || "Không rõ"
      if (!byScanner[name]) byScanner[name] = { total: 0, present: 0, damaged: 0, missing: 0 }
      byScanner[name].total++
      if (rec.status === "PRESENT") byScanner[name].present++
      else if (rec.status === "DAMAGED") byScanner[name].damaged++
      else byScanner[name].missing++
    }
    const byScannerData = Object.entries(byScanner)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([person, stats], i) => ({
        "STT": i + 1,
        "Nhân viên quét": person,
        "Tổng số lần quét": stats.total,
        "Bình thường": stats.present,
        "Hư hỏng": stats.damaged,
        "Không tìm thấy": stats.missing
      }))

    // ── Sheet 5: Thống kê theo NV phụ trách danh mục ─────────────
    const byManager: Record<string, { total: number; present: number; damaged: number; missing: number }> = {}
    for (const rec of records) {
      const isClassroom = !!(rec as any).classroomEq
      if (isClassroom) continue
      const mgr = (rec as any).equipment?.category?.manager?.name || "Chưa phân công"
      if (!byManager[mgr]) byManager[mgr] = { total: 0, present: 0, damaged: 0, missing: 0 }
      byManager[mgr].total++
      if (rec.status === "PRESENT") byManager[mgr].present++
      else if (rec.status === "DAMAGED") byManager[mgr].damaged++
      else byManager[mgr].missing++
    }
    const byManagerData = Object.entries(byManager)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([mgr, stats], i) => ({
        "STT": i + 1,
        "Nhân viên phụ trách DM": mgr,
        "Tổng số lần quét": stats.total,
        "Bình thường": stats.present,
        "Hư hỏng": stats.damaged,
        "Không tìm thấy": stats.missing
      }))

    // ── Build Workbook ────────────────────────────────────────────
    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.json_to_sheet(detailData)
    ws1["!cols"] = [
      { wch: 5 }, { wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 28 },
      { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 20 }
    ]
    XLSX.utils.book_append_sheet(wb, ws1, "Chi tiết kiểm kê")

    const ws2 = XLSX.utils.json_to_sheet(byRoomData)
    ws2["!cols"] = [{ wch: 5 }, { wch: 32 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws2, "Thống kê theo Phòng")

    const ws3 = XLSX.utils.json_to_sheet(byDeviceData)
    ws3["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws3, "Thống kê theo Thiết bị")

    const ws4 = XLSX.utils.json_to_sheet(byScannerData)
    ws4["!cols"] = [{ wch: 5 }, { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws4, "Thống kê theo NV quét")

    if (byManagerData.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(byManagerData)
      ws5["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 16 }]
      XLSX.utils.book_append_sheet(wb, ws5, "Thống kê theo NV phụ trách")
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="KiemKe_${date}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
