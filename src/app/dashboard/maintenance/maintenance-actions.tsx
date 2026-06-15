"use client"

import { useState } from "react"
import { updateMaintenanceStatus, deleteMaintenance } from "./actions"
import { Trash2, Edit, X } from "lucide-react"
import { useConfirm } from "@/components/ui/use-confirm"

export default function MaintenanceActions({ maintenance, role }: { maintenance: any, role: string }) {
  const { confirm } = useConfirm()
  const [isLoading, setIsLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [reason, setReason] = useState("")

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;

    if (newStatus === "LIQUIDATED") {
      setShowPrompt(true);
      return; // Stop and wait for modal
    }

    setIsLoading(true)
    try {
      await updateMaintenanceStatus(maintenance.id, newStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const submitLiquidation = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do thanh lý!");
      return;
    }
    setShowPrompt(false);
    setIsLoading(true);
    try {
      await updateMaintenanceStatus(maintenance.id, "LIQUIDATED", reason);
    } finally {
      setIsLoading(false);
      setReason("");
    }
  }

  const handleDelete = async () => {
    if (!await await confirm("Bạn có chắc chắn muốn xoá bản ghi bảo trì này?")) return
    setIsLoading(true)
    try {
      await deleteMaintenance(maintenance.id)
    } finally {
      setIsLoading(false)
    }
  }

  const hideSelect = maintenance.status === 'COMPLETED' || (maintenance.status === 'LIQUIDATED' && role === 'MANAGER');

  return (
    <div className="flex items-center justify-end gap-2">
      {!hideSelect && (
        <select 
          value={maintenance.status}
          onChange={handleStatusChange}
          disabled={isLoading}
          className="text-sm rounded-md border-gray-300 py-1 pl-2 pr-6 border focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="PENDING">Chờ sửa</option>
          <option value="IN_PROGRESS">Đang sửa</option>
          <option value="COMPLETED">Đã xong</option>
          <option value="BROKEN">Hư hỏng</option>
          <option value="PENDING_LIQUIDATION">Chờ thanh lý</option>
          <option value="LIQUIDATED">Đã thanh lý</option>
        </select>
      )}

      {(role === "ADMIN" || role === "SUPERADMIN") && (
        <button 
          onClick={handleDelete}
          disabled={isLoading}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
          title="Xoá bản ghi"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-semibold text-gray-800">
                Xác nhận thanh lý thiết bị
              </h3>
              <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Số văn bản / Lý do thanh lý:
              </label>
              <input 
                type="text" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
                placeholder="Nhập số quyết định, lý do..." 
                className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setShowPrompt(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={submitLiquidation} 
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
