"use client"

import { Download } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExportExcelButton({ requests }: { requests: any[] }) {
  const handleExport = () => {
    if (!requests || requests.length === 0) {
      alert("Không có dữ liệu để xuất")
      return
    }

    const dataToExport = requests.map(req => ({
      "Họ tên người mượn": req.user.name || req.user.email,
      "Email": req.user.email,
      "Đơn vị": req.user.unit?.name || "",
      "Chức vụ": req.user.position?.name || "",
      "Tên thiết bị": req.equipment.name,
      "Mã vạch": req.equipment.barcode || "",
      "Số lượng": req.quantity,
      "Ngày mượn": new Date(req.borrowDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Ngày trả dự kiến": new Date(req.returnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      "Ngày trả thực tế": req.actualReturnDate ? new Date(req.actualReturnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : "",
      "Trạng thái": req.status === 'PENDING' ? 'Chờ duyệt' :
                    req.status === 'APPROVED' ? 'Đang mượn' :
                    req.status === 'RETURN_REQUESTED' ? 'Chờ xác nhận trả' :
                    req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối',
      "Người xử lý": req.reviewerName || "",
      "Lý do từ chối": req.rejectionReason || "",
      "Tình trạng khi trả": req.returnCondition || "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "LichSuMuonTra")
    
    // Auto-size columns (simple logic)
    const maxWidths = [25, 25, 20, 15, 30, 15, 10, 15, 15, 15, 15, 20, 25, 25]
    worksheet['!cols'] = maxWidths.map(w => ({ wch: w }))

    XLSX.writeFile(workbook, "Danh_sach_muon_tra_thiet_bi.xlsx")
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
    >
      <Download className="w-4 h-4" /> Xuất Excel
    </button>
  )
}
