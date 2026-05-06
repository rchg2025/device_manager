"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // Transform data for Excel
    const excelData: any[] = []
    const merges: any[] = []
    let currentRow = 1 // Row 0 is header
    
    data.forEach(room => {
      const startRow = currentRow;
      if (room.classroomEquipments.length === 0) {
        excelData.push({
          "Tên phòng": room.name,
          "Khu vực": room.area?.name || "Chưa có",
          "Người quản lý": room.manager?.name || "Chưa có",
          "Tên thiết bị": "Không có thiết bị",
          "Số lượng": 0
        })
        currentRow++;
      } else {
        room.classroomEquipments.forEach((eq: any) => {
          excelData.push({
            "Tên phòng": room.name,
            "Khu vực": room.area?.name || "Chưa có",
            "Người quản lý": room.manager?.name || "Chưa có",
            "Tên thiết bị": eq.name,
            "Số lượng": eq.quantity
          })
          currentRow++;
        })
      }
      
      const endRow = currentRow - 1;
      if (endRow > startRow) {
        // Merge "Tên phòng" (col 0, which is A)
        merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } })
        // Merge "Khu vực" (col 1, which is B)
        merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } })
        // Merge "Người quản lý" (col 2, which is C)
        merges.push({ s: { r: startRow, c: 2 }, e: { r: endRow, c: 2 } })
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Áp dụng gộp ô (merges)
    if (merges.length > 0) {
      worksheet['!merges'] = merges;
    }
    
    // Thêm bộ lọc (AutoFilter)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:E1")
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) }
    
    // Căn chỉnh độ rộng cột
    worksheet['!cols'] = [
      { wch: 15 }, // Tên phòng
      { wch: 20 }, // Khu vực
      { wch: 25 }, // Người quản lý
      { wch: 35 }, // Tên thiết bị
      { wch: 10 }  // Số lượng
    ]

    // --- TẠO SHEET THỐNG KÊ ---
    const eqStats: Record<string, number> = {}
    let totalDevices = 0;
    let maxQty = 0;
    
    data.forEach(room => {
      room.classroomEquipments.forEach((eq: any) => {
        eqStats[eq.name] = (eqStats[eq.name] || 0) + eq.quantity
        totalDevices += eq.quantity
      })
    })
    
    // Tìm số lượng lớn nhất để vẽ biểu đồ tương đối
    maxQty = Math.max(...Object.values(eqStats), 1)
    
    const createBarChart = (qty: number, max: number) => {
      const maxBars = 30; // Số lượng block tối đa
      const barsCount = Math.round((qty / max) * maxBars);
      return "█".repeat(barsCount) + "░".repeat(maxBars - barsCount) + ` (${((qty/totalDevices)*100).toFixed(1)}%)`;
    }
    
    const statsData = Object.entries(eqStats)
      .map(([name, qty]) => ({ 
        "Tên thiết bị": name, 
        "Tổng số lượng": qty,
        "Biểu đồ tỷ lệ": createBarChart(qty, maxQty)
      }))
      .sort((a, b) => (b["Tổng số lượng"] as number) - (a["Tổng số lượng"] as number))
      
    // Thêm dòng tổng cộng
    statsData.push({ "Tên thiết bị": "TỔNG CỘNG", "Tổng số lượng": totalDevices, "Biểu đồ tỷ lệ": "" })
      
    const statsWorksheet = XLSX.utils.json_to_sheet(statsData)
    const statsRange = XLSX.utils.decode_range(statsWorksheet['!ref'] || "A1:C1")
    statsWorksheet['!autofilter'] = { ref: XLSX.utils.encode_range(statsRange) }
    statsWorksheet['!cols'] = [ { wch: 40 }, { wch: 15 }, { wch: 45 } ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachThietBi")
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, "ThongKe")

    // Generate buffer and save
    XLSX.writeFile(workbook, "Danh_Sach_Thiet_Bi_Theo_Phong.xlsx")
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
    >
      <Download className="w-4 h-4" /> Xuất Excel
    </button>
  )
}
