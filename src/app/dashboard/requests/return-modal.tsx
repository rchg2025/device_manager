"use client"

import { useState } from "react"
import { Check, X, ClipboardList } from "lucide-react"
import { updateRequestStatus } from "./actions"

export default function ReturnModal({ req, children }: { req: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [returnCondition, setReturnCondition] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleReturn = async () => {
    setIsLoading(true)
    setError("")
    // updateRequestStatus(id, status, rejectionReason, returnCondition)
    const res = await updateRequestStatus(req.id, "RETURNED", undefined, returnCondition)
    if (res?.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Xác nhận trả thiết bị</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}

              <div className="mb-5 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <ClipboardList className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{req.equipment.name}</p>
                    <p className="text-sm text-gray-600 mt-1">Người mượn: <span className="font-medium">{req.user.name}</span></p>
                    <p className="text-sm text-gray-600">Số lượng trả: <span className="font-medium">{req.quantity}</span></p>
                  </div>
                </div>
                {req.equipment.image ? (
                  <img src={req.equipment.image} alt={req.equipment.name} className="w-16 h-16 object-cover rounded-md border border-blue-200 bg-white shrink-0 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 border border-gray-300 shrink-0">N/A</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng thiết bị khi nhận lại (Không bắt buộc)</label>
                <textarea 
                  rows={3} 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-sm border"
                  placeholder="Nhập tình trạng (VD: Bình thường, Trầy xước nhẹ, Hư hỏng...)"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button 
                onClick={handleReturn}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                disabled={isLoading}
              >
                <Check className="w-4 h-4" /> 
                {isLoading ? "Đang xử lý..." : "Xác nhận đã nhận đủ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
