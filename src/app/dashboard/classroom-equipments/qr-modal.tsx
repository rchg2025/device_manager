"use client"
import { useState, useRef } from "react"
import { QrCode, X, Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

interface QrModalProps {
  barcode: string | null
  equipmentName: string
}

export default function QrModal({ barcode, equipmentName }: QrModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)

  const handleDownload = () => {
    if (!qrRef.current) return
    
    // Create a larger canvas to include the text label
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const qrSize = 256
    const padding = 20
    const textHeight = 40
    
    canvas.width = qrSize + padding * 2
    canvas.height = qrSize + padding * 2 + textHeight

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw QR Code
    ctx.drawImage(qrRef.current, padding, padding, qrSize, qrSize)

    // Draw Text
    ctx.fillStyle = "#000000"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    
    // Text truncation if too long
    let displayText = equipmentName
    if (ctx.measureText(displayText).width > canvas.width - padding * 2) {
      displayText = displayText.substring(0, 25) + "..."
    }
    
    ctx.fillText(displayText, canvas.width / 2, canvas.height - textHeight / 2)

    // Download
    const dataUrl = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `QR-${barcode || 'equipment'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!barcode) {
    return (
      <button disabled className="text-gray-400 cursor-not-allowed" title="Chưa có mã vạch">
        <QrCode className="w-4 h-4" />
      </button>
    )
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-blue-600 hover:text-blue-900" 
        title="Xem mã QR"
      >
        <QrCode className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Mã QR Thiết bị</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center bg-gray-50">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <QRCodeCanvas 
                  value={barcode} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  ref={qrRef}
                />
              </div>
              <p className="mt-4 font-medium text-center text-gray-800">{equipmentName}</p>
              <p className="text-xs text-gray-500 mt-1">Mã: {barcode}</p>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Đóng
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                <Download className="w-4 h-4" /> Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
