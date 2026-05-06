"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    // Transform data for Excel
    const excelData: any[] = []
    
    data.forEach(room => {
      if (room.classroomEquipments.length === 0) {
        excelData.push({
          "Tên phòng": room.name,
          "Khu vực": room.area?.name || "Chưa có",
          "Người quản lý": room.manager?.name || "Chưa có",
          "Tên thiết bị": "Không có thiết bị",
          "Số lượng": 0
        })
      } else {
        room.classroomEquipments.forEach((eq: any) => {
          excelData.push({
            "Tên phòng": room.name,
            "Khu vực": room.area?.name || "Chưa có",
            "Người quản lý": room.manager?.name || "Chưa có",
            "Tên thiết bị": eq.name,
            "Số lượng": eq.quantity
          })
        })
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
