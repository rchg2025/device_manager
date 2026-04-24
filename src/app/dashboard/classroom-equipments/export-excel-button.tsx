"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất!")
      return
    }

    const exportData = data.map((item, index) => ({
      "STT": index + 1,
      "Mã thiết bị / QR": item.id,
      "Tên thiết bị": item.name,
      "Khu vực": item.area?.name || "",
      "Phòng học": item.room?.name || "",
      "Danh mục": item.category?.name || "",
      "Cấu hình": item.configs?.map((c: any) => c.name).join(", ") || "",
      "Số lượng": item.quantity,
      "Ngày thêm": new Date(item.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "ThietBiPhongHoc")
    XLSX.writeFile(workbook, "DanhSachThietBiPhongHoc.xlsx")
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
    >
      <Download className="w-4 h-4" /> Xuất Excel
    </button>
  )
}
