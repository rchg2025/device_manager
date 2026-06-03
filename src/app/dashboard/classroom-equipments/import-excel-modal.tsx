"use client"
import { useState, useRef } from "react"
import { Upload, X, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"
import { importClassroomEquipments } from "./actions"

export default function ImportExcelModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<{ success: number, errors: string[] } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const templateData = [
      {
        "Tên thiết bị": "Máy chiếu Panasonic",
        "Khu vực": "Khu A",
        "Phòng học": "A101",
        "Danh mục": "Máy chiếu",
        "Cấu hình": "Full HD, 3000 Lumens",
        "Số lượng": 1
      },
      {
        "Tên thiết bị": "Điều hòa Daikin",
        "Khu vực": "Khu A",
        "Phòng học": "A101",
        "Danh mục": "Điều hòa",
        "Cấu hình": "12000 BTU, Inverter",
        "Số lượng": 2
      }
    ]
    
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    // Adjust column width
    worksheet["!cols"] = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 10 }
    ]
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    XLSX.writeFile(workbook, "Template_Nhap_Thiet_Bi.xlsx")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
        setFile(selected)
        setResults(null)
      } else {
        toast.error("Vui lòng chọn file Excel (.xlsx, .xls)")
        e.target.value = ""
      }
    }
  }

  const handleImport = async () => {
    if (!file) return
    setIsLoading(true)
    setResults(null)
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (jsonData.length === 0) {
        toast.error("File Excel không có dữ liệu")
        setIsLoading(false)
        return
      }

      const res = await importClassroomEquipments(jsonData)
      if (res.error) {
        toast.error(res.error)
      } else if (res.results) {
        setResults(res.results)
        if (res.results.success > 0) {
          toast.success(`Nhập thành công ${res.results.success} thiết bị`)
        }
      }
      
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Đã xảy ra lỗi khi đọc file hoặc import")
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const resetModal = () => {
    setIsOpen(false)
    setFile(null)
    setResults(null)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
      >
        <Upload className="w-4 h-4" /> Nhập Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Nhập thiết bị từ Excel
              </h3>
              <button onClick={resetModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Hướng dẫn:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vui lòng tải file mẫu và điền dữ liệu theo đúng định dạng.</li>
                    <li>Tên Khu vực, Phòng học, Danh mục phải <strong>khớp chính xác</strong> với dữ liệu đã có trên hệ thống.</li>
                    <li>Hệ thống sẽ <strong>bỏ qua</strong> các dòng có thông tin (Khu vực, Phòng, Danh mục) không tồn tại.</li>
                  </ul>
                  <button 
                    onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải file mẫu
                  </button>
                </div>

                {!results ? (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn file Excel
                    </label>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        border border-gray-200 rounded-md"
                    />
                    {file && <p className="mt-2 text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Đã chọn: {file.name}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="font-medium text-gray-800 flex justify-between">
                        <span>Thiết bị nhập thành công:</span>
                        <span className="text-green-600 font-bold">{results.success}</span>
                      </p>
                      <p className="font-medium text-gray-800 flex justify-between mt-2">
                        <span>Thiết bị lỗi (bị bỏ qua):</span>
                        <span className="text-red-600 font-bold">{results.errors.length}</span>
                      </p>
                    </div>
                    
                    {results.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-sm text-red-600 flex items-center gap-1 mb-2">
                          <AlertCircle className="w-4 h-4" /> Chi tiết lỗi:
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded p-3 max-h-40 overflow-y-auto">
                          <ul className="text-xs text-red-700 space-y-1">
                            {results.errors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-white shrink-0">
              <button 
                onClick={resetModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Đóng
              </button>
              {!results && (
                <button 
                  onClick={handleImport}
                  disabled={!file || isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Nhập dữ liệu
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
