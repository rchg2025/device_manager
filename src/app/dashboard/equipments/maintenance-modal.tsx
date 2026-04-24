"use client"
import { useState } from "react"
import { Wrench, X, Check } from "lucide-react"
import { createMaintenance } from "../maintenance/actions"

export default function MaintenanceModal({ equipmentId, equipmentName }: { equipmentId: string, equipmentName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    formData.append("equipmentId", equipmentId)
    const res = await createMaintenance(formData)
    setIsLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      alert("Đã ghi nhận bảo trì thành công!")
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-orange-600 hover:text-orange-900"
        title="Ghi nhận bảo trì"
      >
        <Wrench className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" /> Ghi nhận bảo trì
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị</label>
                <div className="w-full bg-gray-100 py-2 px-3 rounded-md text-sm text-gray-700 font-medium border border-gray-200">
                  {equipmentName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ghi nhận</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả hỏng hóc / sửa chữa</label>
                <textarea name="description" required rows={3} placeholder="VD: Thay màn hình, sửa cổng sạc..." className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí dự kiến / Thực tế (VNĐ)</label>
                <input type="number" name="cost" min="0" placeholder="0" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
                <select name="status" className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:border-blue-500 focus:ring-blue-500">
                  <option value="PENDING">Chờ sửa chữa</option>
                  <option value="IN_PROGRESS">Đang sửa chữa</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50">
                  <Check className="w-4 h-4" /> {isLoading ? "Đang lưu..." : "Lưu bảo trì"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
