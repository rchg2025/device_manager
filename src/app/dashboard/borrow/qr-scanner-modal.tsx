"use client"
import { useState } from "react"
import { QrCode, X } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"

interface QrScannerModalProps {
  onScanSuccess: (barcode: string) => void
}

export default function QrScannerModal({ onScanSuccess }: QrScannerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string>("")

  const handleScan = (result: any) => {
    if (result && result.length > 0 && result[0].rawValue) {
      setIsOpen(false)
      onScanSuccess(result[0].rawValue)
    }
  }

  const handleError = (err: unknown) => {
    console.error(err)
    setError("Không thể truy cập camera hoặc lỗi quét mã.")
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md border border-gray-300 transition-colors text-sm font-medium"
      >
        <QrCode className="w-4 h-4" />
        Quét mã QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                Quét mã QR thiết bị
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 flex-1 min-h-[300px] flex flex-col items-center justify-center relative">
              {error ? (
                <div className="text-red-600 text-center p-4">
                  <p>{error}</p>
                  <button 
                    onClick={() => setError("")} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <Scanner 
                    onScan={handleScan}
                    onError={handleError}
                    components={{
                      audio: false,
                      finder: true
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 text-center mt-4">
                Đưa mã QR của thiết bị vào khung ngắm để tự động chọn.
              </p>
            </div>

            <div className="p-4 border-t flex justify-end bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
