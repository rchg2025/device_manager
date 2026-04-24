"use client"
import { useState } from "react"
import { createEquipment } from "./actions"

export default function CreateEquipmentForm({
  categories
}: {
  categories: any[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const res = await createEquipment(formData)
    setIsLoading(false)

    if (res?.error) {
      alert(res.error)
    } else {
      alert("Thêm thiết bị thành công!")
      window.location.reload()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
        <input 
          type="text" name="name" required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
          placeholder="VD: Màn hình Dell"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Tùy chọn)</label>
        <input 
          type="text" name="barcode"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
          placeholder="Mã phân loại chung"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Tùy chọn)</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-xs text-gray-500">Bấm để tải ảnh lên (tối đa 5MB)</p>
            </div>
            <input name="image" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
        <select name="categoryId" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border bg-white">
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tổng</label>
        <input 
          type="number" name="totalQty" min="1" required defaultValue="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
        />
      </div>

      <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
        {isLoading ? "Đang xử lý..." : "Lưu thiết bị"}
      </button>
    </form>
  )
}
