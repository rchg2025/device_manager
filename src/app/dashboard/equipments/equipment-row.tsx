"use client"
import { useState } from "react"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { updateEquipment, deleteEquipment } from "./actions"

export default function EquipmentRow({ eq, categories }: { eq: any, categories: any[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    formData.append("id", eq.id)
    await updateEquipment(formData)
    setIsEditing(false)
    setIsLoading(false)
  }

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      await deleteEquipment(eq.id)
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-4">
          <form action={handleUpdate} className="grid grid-cols-6 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tên thiết bị</label>
              <input type="text" name="name" defaultValue={eq.name} required className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mã vạch</label>
              <input type="text" name="barcode" defaultValue={eq.barcode || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
              <select name="categoryId" defaultValue={eq.categoryId} required className="w-full border-gray-300 rounded text-sm py-1 px-2 border">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tổng SL</label>
              <input type="number" name="totalQty" defaultValue={eq.totalQty} min="1" required className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Link Ảnh</label>
              <input type="url" name="image" defaultValue={eq.image || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            <div className="flex items-end gap-2 h-full pb-1">
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
      <td className="px-6 py-4 whitespace-nowrap">
        {eq.image ? (
          <img src={eq.image} alt={eq.name} className="h-10 w-10 rounded-md object-cover border border-gray-200" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{eq.name}</div>
        <div className="text-sm text-gray-500">{eq.barcode || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.category.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.totalQty}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.availableQty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {eq.availableQty}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={eq.totalQty !== eq.availableQty} className={`text-red-600 hover:text-red-900 ${eq.totalQty !== eq.availableQty ? 'opacity-50 cursor-not-allowed' : ''}`} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
