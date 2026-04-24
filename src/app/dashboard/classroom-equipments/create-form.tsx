"use client"
import { useState } from "react"
import { Upload } from "lucide-react"
import { createClassroomEquipment } from "./actions"
import Select from "react-select"

export default function CreateClassroomEqForm({
  areas,
  rooms,
  categories,
  configs
}: {
  areas: any[],
  rooms: any[],
  categories: any[],
  configs: any[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const res = await createClassroomEquipment(formData)
    setIsLoading(false)
    
    if (res?.error) {
      alert(res.error)
    } else {
      alert("Thêm thiết bị thành công!")
      // Reset form if needed by forcing a reload or using a ref
      window.location.reload()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
        <input type="text" name="name" required placeholder="VD: Máy chiếu Panasonic" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (Tùy chọn)</label>
        <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="flex justify-center text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1 border border-blue-100 shadow-sm">
                <span>Chọn File</span>
                <input name="image" type="file" className="sr-only" accept="image/*" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
        <select name="areaId" required className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white">
          <option value="">-- Chọn khu vực --</option>
          {areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phòng học</label>
        <Select
          name="roomId"
          required
          placeholder="-- Tìm hoặc chọn phòng học --"
          noOptionsMessage={() => "Không tìm thấy phòng học"}
          options={rooms.map((r: any) => ({ value: r.id, label: r.name }))}
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: '#d1d5db',
              borderRadius: '0.375rem',
              padding: '1px 0',
              minHeight: '38px',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#3b82f6'
              }
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
              color: state.isSelected ? 'white' : '#1f2937',
              cursor: 'pointer'
            })
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục thiết bị</label>
        <select name="categoryId" required className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white">
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cấu hình (Chọn nhiều)</label>
        <select name="configIds" multiple className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white h-24">
          {configs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-1">Giữ Ctrl (hoặc Cmd) để chọn nhiều</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
        <input type="number" name="quantity" required min="1" defaultValue="1" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500 bg-white" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors">
          {isLoading ? "Đang xử lý..." : "Thêm mới"}
        </button>
      </div>
    </form>
  )
}
