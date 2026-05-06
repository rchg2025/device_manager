"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // Transform data for Excel
    const excelData = data.map(room => {
      const equipmentSummary = room.classroomEquipments.map((eq: any) => `${eq.name} x${eq.quantity}`).join(", ")
      const totalEquipments = room.classroomEquipments.reduce((sum: number, eq: any) => sum + eq.quantity, 0)
      
      return {
        "Tên phòng": room.name,
        "Khu vực": room.area?.name || "Chưa có",
        "Người quản lý": room.manager?.name || "Chưa có",
        "Tổng số thiết bị": totalEquipments,
        "Chi tiết thiết bị": equipmentSummary
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachThietBi")

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
