"use client"
import { useState } from "react"
import ClassroomEqRow from "./equipment-row"
import { MonitorPlay, Trash2 } from "lucide-react"
import { deleteManyClassroomEquipments } from "./actions"
import toast from "react-hot-toast"
import Pagination from "../pagination"

export default function EquipmentTable({ 
  items, 
  areas, 
  rooms, 
  categories, 
  configs, 
  totalPages, 
  page, 
  userRole 
}: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN"

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((item: any) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} thiết bị đã chọn?`)) return
    setIsDeleting(true)
    const res = await deleteManyClassroomEquipments(selectedIds)
    setIsDeleting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Xóa thành công!")
      setSelectedIds([])
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {isAdmin && selectedIds.length > 0 && (
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">Đã chọn {selectedIds.length} thiết bị</span>
          <button 
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Đang xóa..." : "Xóa đã chọn"}
          </button>
        </div>
      )}
      <div className="overflow-x-auto min-h-[350px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && (
                <th className="px-4 py-4 text-left w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin thiết bị</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vị trí</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tình trạng</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item: any) => (
              <ClassroomEqRow 
                key={item.id} 
                item={item} 
                areas={areas}
                rooms={rooms}
                categories={categories}
                configs={configs}
                isAdmin={isAdmin}
                isSelected={selectedIds.includes(item.id)}
                onSelect={(checked: boolean) => handleSelect(item.id, checked)}
              />
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <MonitorPlay className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900">Chưa có thiết bị nào</p>
                    <p className="text-sm">Vui lòng thêm thiết bị mới hoặc thay đổi bộ lọc tìm kiếm.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="border-t border-gray-200">
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  )
}
