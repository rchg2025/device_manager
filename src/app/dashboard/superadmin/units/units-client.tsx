"use client"

import { useState } from "react"
import { createUnit, updateUnit, deleteUnit } from "./actions"
import { Building, Plus, Trash2, Edit2, Users, Package, ClipboardList } from "lucide-react"

export default function UnitsClient({ initialUnits }: { initialUnits: any[] }) {
  const [units, setUnits] = useState(initialUnits)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setLoading(true)
    const res = await createUnit(newName)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      setNewName("")
      setIsAdding(false)
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa đơn vị này? Mọi dữ liệu bên trong có thể bị ảnh hưởng!")) return
    setLoading(true)
    const res = await deleteUnit(id)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      window.location.reload()
    }
  }

  const handleUpdate = async (id: string, currentName: string) => {
    const name = prompt("Nhập tên mới:", currentName)
    if (!name || name === currentName) return
    setLoading(true)
    const res = await updateUnit(id, name)
    setLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Danh sách Đơn vị hiện tại ({units.length})
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Thêm đơn vị mới
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-3">
          <input 
            type="text" 
            autoFocus
            required
            placeholder="Tên đơn vị (Ví dụ: Cơ sở 1, Khoa Điện, ...)" 
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button 
            type="button" 
            onClick={() => setIsAdding(false)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
          >
            Hủy
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map(unit => (
          <div key={unit.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-gray-50/50">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-800 text-lg">{unit.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => handleUpdate(unit.id, unit.name)} className="p-1.5 text-gray-500 hover:bg-white hover:text-blue-600 rounded-md bg-transparent">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(unit.id)} className="p-1.5 text-gray-500 hover:bg-white hover:text-red-600 rounded-md bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
              <div className="text-center" title="Số lượng thành viên">
                <Users className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-sm font-semibold text-gray-700">{unit._count.users}</span>
              </div>
              <div className="text-center border-l border-r border-gray-200" title="Số thiết bị">
                <Package className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-sm font-semibold text-gray-700">{unit._count.equipments}</span>
              </div>
              <div className="text-center" title="Lượt mượn trả">
                <ClipboardList className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-sm font-semibold text-gray-700">{unit._count.borrowRequests}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 text-xs text-gray-400 font-mono text-center truncate">
              ID: {unit.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
