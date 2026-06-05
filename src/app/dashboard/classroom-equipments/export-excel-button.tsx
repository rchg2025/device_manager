"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"
import { useState } from "react"
import { getAllClassroomEquipmentsForExport } from "./actions"

export default function ExportExcelButton({ searchParams }: { searchParams: { query?: string, area?: string, room?: string, category?: string } }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const data = await getAllClassroomEquipmentsForExport({
        query: searchParams.query,
        areaId: searchParams.area,
        roomId: searchParams.room,
        categoryId: searchParams.category
      })

      if (!data || data.length === 0) {
        toast.error("Không có dữ liệu để xuất!")
        return
      }

      const exportData = data.map((item: any, index: number) => ({
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
      toast.success("Xuất file Excel thành công!")
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi xuất file Excel")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
    >
      <Download className="w-4 h-4" /> {isExporting ? "Đang xuất..." : "Xuất Excel"}
    </button>
  )
}

