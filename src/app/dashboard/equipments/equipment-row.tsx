"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { updateEquipment, deleteEquipment } from "./actions"
import QrModal from "./qr-modal"
import MaintenanceModal from "./maintenance-modal"

export default function EquipmentRow({ eq, categories }: { eq: any, categories: any[] }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    formData.append("id", eq.id)
    await updateEquipment(formData)
    setIsEditing(false)
    setIsLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      setIsLoading(true)
      try {
        const res = await deleteEquipment(eq.id)
        if (res?.error) {
          alert(res.error)
        } else {
          alert("Xóa thành công!")
          window.location.reload()
        }
      } catch (err: any) {
        alert("Lỗi kết nối hoặc máy chủ: " + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={8} className="px-6 py-4">
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Ảnh (Tùy chọn)</label>
              <input type="file" name="image" accept="image/*" className="w-full text-[10px] py-1 px-1 border-gray-300 rounded border bg-white" />
              <input type="hidden" name="existingImage" value={eq.image || ""} />
              {eq.image && <p className="text-[9px] text-gray-400 mt-0.5">Đã có ảnh.</p>}
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

  let imgUrl = eq.image;
  if (imgUrl?.includes('drive.google.com/uc?')) {
    try {
      const fileId = new URL(imgUrl).searchParams.get('id');
      if (fileId) imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    } catch (e) {}
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        {imgUrl ? (
          <img src={imgUrl} alt={eq.name} className="h-10 w-10 rounded-md object-cover border border-gray-200 bg-gray-50" loading="lazy" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{eq.name}</div>
        <div className="text-sm text-gray-500">{eq.barcode || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.category.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{eq.creatorName || "N/A"}</div>
        <div className="text-xs text-gray-500">{new Date(eq.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.totalQty}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eq.availableQty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {eq.availableQty}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-3">
          <MaintenanceModal equipmentId={eq.id} equipmentName={eq.name} availableQty={eq.availableQty} />
          <QrModal barcode={eq.barcode} equipmentName={eq.name} />
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
