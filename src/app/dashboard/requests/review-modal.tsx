"use client"

import { useState } from "react"
import { Check, X, User, Phone, Briefcase, Building } from "lucide-react"
import { updateRequestStatus } from "./actions"

export default function ReviewModal({ req, children }: { req: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    setIsLoading(true)
    setError("")
    const res = await updateRequestStatus(req.id, "APPROVED")
    if (res?.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      setIsOpen(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Vui lòng nhập lý do từ chối")
      return
    }
    setIsLoading(true)
    setError("")
    const res = await updateRequestStatus(req.id, "REJECTED", rejectionReason)
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Duyệt Yêu Cầu Mượn</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}

              <div className="space-y-6">
                {/* Thông tin người mượn */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Người Mượn</h4>
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {req.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{req.user.name}</p>
                        <p className="text-sm text-gray-500">{req.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-100 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {req.user.phone || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4 text-gray-400" />
                        {req.user.unit?.name || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {req.user.position?.name || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin thiết bị */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Thiết Bị Yêu Cầu</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900 mb-1">{req.equipment.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-500">Số lượng mượn:</span> <span className="font-semibold">{req.quantity}</span></p>
                      <p><span className="text-gray-500">Tồn kho hiện tại:</span> <span className="font-semibold text-blue-600">{req.equipment.availableQty}</span></p>
                      <p className="col-span-2"><span className="text-gray-500">Thời gian mượn:</span> {new Date(req.borrowDate).toLocaleDateString('vi-VN')} - {new Date(req.returnDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Khung nhập lý do từ chối */}
                {isRejecting && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-red-700 mb-1">Lý do từ chối *</label>
                    <textarea 
                      rows={3} 
                      className="w-full border-red-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 p-3 text-sm border"
                      placeholder="Nhập lý do từ chối (VD: Thiết bị đã được mượn, Số lượng không đủ...)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
              {!isRejecting ? (
                <>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    disabled={isLoading || req.quantity > req.equipment.availableQty}
                  >
                    <Check className="w-4 h-4" /> 
                    {isLoading ? "Đang xử lý..." : "Duyệt cho mượn"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" /> 
                    {isLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
