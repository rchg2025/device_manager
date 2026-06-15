"use client"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useConfirm } from "@/components/ui/use-confirm"
import { deleteManyClassroomEqCategories } from "./actions"
import CategoryRow from "./category-row"
import Pagination from "../pagination"

export default function CategoryTab({ 
  title, 
  createAction, 
  data, 
  managers, 
  totalPages, 
  page, 
  countLabel, 
  countKey, 
  type,
  userRole
}: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { confirm } = useConfirm()
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = (userRole === "ADMIN" || userRole === "SUPERADMIN") && type === 'classroomEqCategory'

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map((item: any) => item.id))
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
    if (!await confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mục đã chọn?`)) return
    setIsDeleting(true)
    
    let res;
    if (type === 'classroomEqCategory') {
      res = await deleteManyClassroomEqCategories(selectedIds)
    }

    setIsDeleting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Xóa thành công!")
      setSelectedIds([])
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 h-fit">
        <h4 className="text-lg font-semibold mb-4 border-b pb-2">Thêm {title} mới</h4>
        <form action={createAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên {title.toLowerCase()}</label>
            <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" placeholder={`Nhập tên ${title.toLowerCase()}...`} />
          </div>
          {type === 'category' && managers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên quản lý (Tùy chọn)</label>
              <select name="managerId" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white">
                <option value="">-- Chọn người quản lý --</option>
                {managers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors">Thêm mới</button>
        </form>
      </div>
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isAdmin && selectedIds.length > 0 && (
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between">
              <span className="text-sm text-blue-800 font-medium">Đã chọn {selectedIds.length} mục</span>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên {title.toLowerCase()}</th>
                  {type === 'category' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quản lý</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng {countLabel}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item: any) => (
                  <CategoryRow 
                    key={item.id} 
                    item={item} 
                    countLabel={countLabel} 
                    countValue={item.totalCount !== undefined ? item.totalCount : (item._count?.[countKey] || 0)} 
                    type={type} 
                    managers={managers} 
                    isAdmin={isAdmin}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={(checked: boolean) => handleSelect(item.id, checked)}
                  />
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={type === 'category' ? 4 : (isAdmin ? 4 : 3)} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  )
}
