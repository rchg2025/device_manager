"use client"

import { useState } from "react"
import { updateMaintenanceStatus, deleteMaintenance } from "./actions"
import { Trash2, Edit } from "lucide-react"

export default function MaintenanceActions({ maintenance, role }: { maintenance: any, role: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoading(true)
    try {
      await updateMaintenanceStatus(maintenance.id, e.target.value)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xoá bản ghi bảo trì này?")) return
    setIsLoading(true)
    try {
      await deleteMaintenance(maintenance.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {maintenance.status !== 'COMPLETED' && (
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
        </select>
      )}

      {role === "ADMIN" && (
        <button 
          onClick={handleDelete}
          disabled={isLoading}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
          title="Xoá bản ghi"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
