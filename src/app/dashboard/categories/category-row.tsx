"use client"
import { useState } from "react"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { 
  updateCategory, deleteCategory, updateUnit, deleteUnit, updatePosition, deletePosition,
  updateArea, deleteArea, updateRoom, deleteRoom, updateClassroomEqCategory, deleteClassroomEqCategory, updateDeviceConfig, deleteDeviceConfig
} from "./actions"

type ItemType = "category" | "unit" | "position" | "area" | "room" | "classroomEqCategory" | "deviceConfig"

export default function CategoryRow({ 
  item, 
  type, 
  countLabel, 
  countValue,
  subtitle,
  extraData
}: { 
  item: any, 
  type: ItemType, 
  countLabel: string, 
  countValue: number,
  subtitle?: string,
  extraData?: { areas?: any[], managers?: any[] }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    formData.append("id", item.id)
    
    if (type === "category") await updateCategory(formData)
    if (type === "unit") await updateUnit(formData)
    if (type === "position") await updatePosition(formData)
    if (type === "area") await updateArea(formData)
    if (type === "room") await updateRoom(formData)
    if (type === "classroomEqCategory") await updateClassroomEqCategory(formData)
    if (type === "deviceConfig") await updateDeviceConfig(formData)
      
    setIsEditing(false)
    setIsLoading(false)
  }

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      let res;
      if (type === "category") res = await deleteCategory(item.id)
      if (type === "unit") res = await deleteUnit(item.id)
      if (type === "position") res = await deletePosition(item.id)
      if (type === "area") res = await deleteArea(item.id)
      if (type === "room") res = await deleteRoom(item.id)
      if (type === "classroomEqCategory") res = await deleteClassroomEqCategory(item.id)
      if (type === "deviceConfig") res = await deleteDeviceConfig(item.id)

      if (res?.error) {
        alert(res.error)
      } else {
        alert("Xóa thành công!")
        window.location.reload()
      }
    }
  }

  const allAreas = extraData?.areas
  const allManagers = extraData?.managers

  if (isEditing) {
    return (
      <tr>
        <td colSpan={type === 'room' ? 4 : 3} className="px-6 py-4">
          <form action={handleUpdate} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <input 
              type="text" 
              name="name" 
              defaultValue={item.name} 
              required
              className="flex-1 border-gray-300 rounded text-sm py-1.5 px-3 border min-w-[150px]" 
            />
            {type === 'room' && allAreas && (
              <>
                <select name="areaId" defaultValue={item.area?.id} required className="border-gray-300 rounded text-sm py-1.5 px-3 border min-w-[120px] bg-white">
                  {allAreas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <select name="managerId" defaultValue={item.manager?.id || ""} className="border-gray-300 rounded text-sm py-1.5 px-3 border min-w-[140px] bg-white">
                  <option value="">-- Quản lý --</option>
                  {allManagers?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </>
            )}
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
      {type === 'room' && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div>{item.area?.name || subtitle}</div>
          {item.manager?.name && <div className="text-xs text-blue-600 mt-1">QL: {item.manager.name}</div>}
        </td>
      )}
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
