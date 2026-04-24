"use client"
import { useState, useRef } from "react"
import { Download, Upload, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { importMembersExcel } from "./actions"

export default function ExcelButtons() {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const data = [
      {
        "Họ và tên": "Nguyễn Văn A",
        "Email": "nguyenvana@example.com",
        "Số điện thoại": "0123456789"
      }
    ]
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    
    // Auto resize cols
    worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }]
    
    XLSX.writeFile(workbook, "Template_NhapThanhVien.xlsx")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        
        if (data.length === 0) {
          alert("File trống!")
          return
        }

        const res = await importMembersExcel(data)
        alert(`Nhập thành công ${res.successCount} thành viên. Bỏ qua ${res.skipCount} thành viên do trùng Email. Mật khẩu mặc định là 123456.`)
      } catch (err) {
        console.error(err)
        alert("Có lỗi xảy ra khi đọc file Excel.")
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a 
        href="/api/export/members" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors shadow-sm"
      >
        <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
      </a>
      
      <div className="relative">
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" /> {isImporting ? "Đang xử lý..." : "Nhập từ Excel"}
        </button>
      </div>

      <button 
        onClick={handleDownloadTemplate}
        className="text-xs text-blue-600 hover:underline"
      >
        Tải file mẫu
      </button>
    </div>
  )
}
