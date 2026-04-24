"use client"
import { useState, useRef } from "react"
import { QrCode, X, Upload } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import jsQR from "jsqr"

interface QrScannerModalProps {
  onScanSuccess: (barcode: string) => void
}

export default function QrScannerModal({ onScanSuccess }: QrScannerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          setError("Lỗi xử lý ảnh.")
          return
        }
        ctx.drawImage(img, 0, 0, img.width, img.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setIsOpen(false)
          onScanSuccess(code.data)
        } else {
          setError("Không tìm thấy mã QR trong ảnh hoặc ảnh mờ/không đúng định dạng.")
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    // reset input
    e.target.value = ""
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => { setIsOpen(true); setError(""); }}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md border border-gray-300 transition-colors text-sm font-medium"
      >
        <QrCode className="w-4 h-4" />
        Quét mã QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                Quét mã QR thiết bị
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 flex-1 min-h-[300px] flex flex-col items-center justify-center relative overflow-y-auto">
              {error && (
                <div className="text-red-600 text-center p-3 mb-4 bg-red-50 w-full rounded border border-red-100">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-black">
                <Scanner 
                  onScan={handleScan}
                  onError={handleError}
                  components={{
                    audio: false,
                    finder: true
                  }}
                />
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Đưa mã QR của thiết bị vào khung ngắm để tự động chọn.
              </p>
              
              <div className="mt-4 pt-4 border-t w-full flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-3">Hoặc</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium w-full justify-center"
                >
                  <Upload className="w-4 h-4" />
                  Tải ảnh mã QR từ thư viện
                </button>
              </div>
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
