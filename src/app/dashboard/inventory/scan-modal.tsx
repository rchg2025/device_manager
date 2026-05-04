"use client"
import { useState, useRef, useCallback } from "react"
import { QrCode, X, Upload, CheckCircle, AlertTriangle, Search, ScanLine, MapPin, FileText, Package, MonitorPlay, Loader2 } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import jsQR from "jsqr"
import { getEquipmentByBarcode, saveInventoryRecord } from "./actions"

interface ScanModalProps {
  activeSessionId?: string
}

type EquipmentResult = {
  type: 'equipment' | 'classroom-equipment'
  data: any
}

export default function ScanModal({ activeSessionId }: ScanModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'scan' | 'confirm'>('scan')
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<EquipmentResult | null>(null)
  const [location, setLocation] = useState("")
  const [note, setNote] = useState("")
  const [status, setStatus] = useState("PRESENT")
  const [quantity, setQuantity] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => {
    setIsOpen(true)
    setStep('scan')
    setScanning(true)
    setError("")
    setResult(null)
    setLocation("")
    setNote("")
    setStatus("PRESENT")
    setQuantity(1)
    setSuccess(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const processBarcode = useCallback(async (barcode: string) => {
    if (!scanning) return
    setScanning(false)
    setLoading(true)
    setError("")
    try {
      const res = await getEquipmentByBarcode(barcode, activeSessionId)
      if (res.error) {
        setError(res.error)
        setScanning(true)
      } else {
        setResult(res as EquipmentResult)
        // Pre-fill location from classroom equipment
        if (res.type === 'classroom-equipment') {
          const d = res.data
          setLocation(`${d.room?.name || ''} - ${d.area?.name || ''}`.trim().replace(/^-\s*|-\s*$/g, '').trim())
        }
        setStep('confirm')
      }
    } finally {
      setLoading(false)
    }
  }, [scanning])

  const handleScan = (scans: any) => {
    if (scans?.length > 0 && scans[0].rawValue) {
      processBarcode(scans[0].rawValue)
    }
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
        let w = img.width
        let h = img.height
        const maxDim = 1500
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        
        // Fill white background for transparent PNGs
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        
        const imageData = ctx.getImageData(0, 0, w, h)
        // attemptBoth helps with inverted or hard-to-read codes
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" })
        if (code) processBarcode(code.data)
        else setError("Không tìm thấy mã QR trong ảnh. Vui lòng thử ảnh khác hoặc chụp rõ nét hơn.")
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleSave = async () => {
    if (!result) return
    setLoading(true)
    try {
      const data = {
        sessionId: activeSessionId,
        equipmentId: result.type === 'equipment' ? result.data.id : undefined,
        classroomEqId: result.type === 'classroom-equipment' ? result.data.id : undefined,
        location,
        note,
        status,
        quantity
      }
      const res = await saveInventoryRecord(data)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setStep('scan')
          setScanning(true)
          setResult(null)
          setLocation("")
          setNote("")
          setStatus("PRESENT")
          setQuantity(1)
          setSuccess(false)
          setError("")
        }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'PRESENT', label: 'Bình thường', color: 'text-green-700 bg-green-50 border-green-200' },
    { value: 'DAMAGED', label: 'Hư hỏng', color: 'text-red-700 bg-red-50 border-red-200' },
    { value: 'MISSING', label: 'Không tìm thấy', color: 'text-gray-700 bg-gray-50 border-gray-200' },
  ]

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
      >
        <ScanLine className="w-4 h-4" /> Quét mã QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
                {step === 'scan' ? 'Quét mã QR Kiểm Kê' : 'Xác nhận thông tin'}
              </h3>
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {step === 'scan' && (
                <div className="p-4 flex flex-col items-center gap-4">
                  {loading && (
                    <div className="flex items-center gap-2 text-blue-600 py-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang tra cứu thiết bị...
                    </div>
                  )}
                  {error && (
                    <div className="w-full flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                    </div>
                  )}
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-black shadow-inner">
                    {scanning && <Scanner onScan={handleScan} onError={() => setError("Không thể mở camera.")} components={{ audio: false, finder: true }} />}
                  </div>
                  <p className="text-sm text-gray-500 text-center">Đưa mã QR của thiết bị vào khung ngắm</p>
                  <div className="w-full border-t pt-3 flex flex-col items-center gap-2">
                    <p className="text-xs text-gray-400">Hoặc tải ảnh mã QR</p>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm w-full justify-center">
                      <Upload className="w-4 h-4" /> Chọn ảnh từ thư viện
                    </button>
                  </div>
                </div>
              )}

              {step === 'confirm' && result && (
                <div className="p-4 space-y-4">
                  {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-green-600 gap-3">
                      <CheckCircle className="w-16 h-16" />
                      <p className="text-lg font-semibold">Đã lưu kết quả kiểm kê!</p>
                    </div>
                  ) : (
                    <>
                      {/* Equipment Info Card */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                          {result.type === 'equipment' ? <Package className="w-5 h-5" /> : <MonitorPlay className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{result.data.name}</p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            {result.type === 'equipment'
                              ? `Danh mục: ${result.data.category?.name || 'N/A'}`
                              : `${result.data.room?.name} - ${result.data.area?.name}`}
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                        </div>
                      )}

                      {/* Status Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tình trạng thiết bị</label>
                        <div className="grid grid-cols-3 gap-2">
                          {statusOptions.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setStatus(opt.value)}
                              className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all ${status === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-blue-400' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                           Số lượng kiểm kê thực tế
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {(quantity + (result.data.scannedQty || 0)) > (result.type === 'equipment' ? result.data.totalQty : result.data.quantity) && (
                          <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1 bg-orange-50 p-2 rounded border border-orange-100">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>
                              Cảnh báo: Tổng số lượng kiểm kê ({quantity + (result.data.scannedQty || 0)}) vượt quá số lượng trên hệ thống ({result.type === 'equipment' ? result.data.totalQty : result.data.quantity}).
                              {result.data.scannedQty > 0 && ` (Đã quét trước đó: ${result.data.scannedQty})`}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400" /> Vị trí thực tế
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="VD: Phòng B1.01, Kho tầng 2..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-gray-400" /> Ghi chú
                        </label>
                        <textarea
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          rows={2}
                          placeholder="Thêm ghi chú tình trạng chi tiết..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {step === 'confirm' && result && !success && (
              <div className="px-4 py-3 border-t flex gap-2 bg-gray-50">
                <button
                  onClick={() => { setStep('scan'); setScanning(true); setError("") }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                >
                  Quét lại
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Lưu kết quả
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
