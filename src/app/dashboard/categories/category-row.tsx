"use client"
import { useState } from "react"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { updateCategory, deleteCategory, updateUnit, deleteUnit, updatePosition, deletePosition } from "./actions"

type ItemType = "category" | "unit" | "position"

export default function CategoryRow({ 
  item, 
  type, 
  countLabel, 
  countValue 
}: { 
  item: any, 
  type: ItemType, 
  countLabel: string, 
  countValue: number 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    formData.append("id", item.id)
    
    if (type === "category") await updateCategory(formData)
    if (type === "unit") await updateUnit(formData)
    if (type === "position") await updatePosition(formData)
      
    setIsEditing(false)
    setIsLoading(false)
  }

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      if (type === "category") await deleteCategory(item.id)
      if (type === "unit") await deleteUnit(item.id)
      if (type === "position") await deletePosition(item.id)
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={3} className="px-6 py-4">
          <form action={handleUpdate} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input 
              type="text" 
              name="name" 
              defaultValue={item.name} 
              required
              className="flex-1 border-gray-300 rounded text-sm py-1.5 px-3 border" 
            />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={isLoading} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700">
                <Check className="w-4 h-4" /> Lưu
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-300">
                <X className="w-4 h-4" /> Hủy
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{countValue} {countLabel}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={countValue > 0} className={`text-red-600 hover:text-red-900 ${countValue > 0 ? 'opacity-50 cursor-not-allowed' : ''}`} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
