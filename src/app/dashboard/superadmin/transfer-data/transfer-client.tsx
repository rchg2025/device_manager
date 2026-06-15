"use client"

import { useState } from "react"
import { transferData } from "./actions"
import { ArrowRightLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { useConfirm } from "@/components/ui/use-confirm"

export default function TransferClient({ units }: { units: any[] }) {
  const { confirm } = useConfirm()
  const [fromUnitId, setFromUnitId] = useState("")
  const [toUnitId, setToUnitId] = useState("")
  const [dataTypes, setDataTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean, error?: string, results?: Record<string, number> } | null>(null)

  const DATA_TYPES = [
    { id: "categories", label: "Danh mục thiết bị", icon: "📑" },
    { id: "equipments", label: "Kho Thiết bị", icon: "📦" },
    { id: "users", label: "Người dùng (Trừ SA)", icon: "👥" },
    { id: "borrowRequests", label: "Phiếu mượn / trả", icon: "📋" },
    { id: "inventory", label: "Phiếu kiểm kê", icon: "✅" },
    { id: "maintenance", label: "Phiếu bảo trì", icon: "🔧" },
    { id: "areasRooms", label: "Khu vực & Phòng", icon: "🏢" },
    { id: "classroomEquipments", label: "Thiết bị phòng học", icon: "🖥️" },
    { id: "configs", label: "Cấu hình & Nhật ký", icon: "⚙️" }
  ]

  const handleToggleType = (id: string) => {
    if (dataTypes.includes(id)) {
      setDataTypes(dataTypes.filter(t => t !== id))
    } else {
      setDataTypes([...dataTypes, id])
    }
  }

  const handleSelectAll = () => {
    if (dataTypes.length === DATA_TYPES.length) {
      setDataTypes([]) // Bỏ chọn tất cả
    } else {
      setDataTypes(DATA_TYPES.map(t => t.id)) // Chọn tất cả
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromUnitId || !toUnitId) return alert("Vui lòng chọn đủ nguồn và đích")
    if (fromUnitId === toUnitId) return alert("Nguồn và đích trùng nhau")
    if (dataTypes.length === 0) return alert("Chọn ít nhất một loại dữ liệu")

    if (!await confirm("BẠN CÓ CHẮC CHẮN MƯỐN CHUYỂN DỮ LIỆU?\nHành động này sẽ cập nhật hàng loạt dữ liệu trong hệ thống!")) return

    setLoading(true)
    setResult(null)
    const res = await transferData(fromUnitId, toUnitId, dataTypes)
    setResult(res)
    setLoading(false)
    if (res.success) {
      setDataTypes([]) // reset
    }
  }

  const getUnitInfo = (id: string) => units.find(u => u.id === id)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Chọn Đơn vị */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-gray-50 p-6 rounded-lg border">
          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">CHUYỂN TỪ (Nguồn)</label>
            <select 
              className="w-full border p-2.5 rounded-md focus:ring-2 outline-none"
              value={fromUnitId}
              onChange={e => setFromUnitId(e.target.value)}
              required
            >
              <option value="">-- Chọn đơn vị nguồn --</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {fromUnitId && getUnitInfo(fromUnitId) && (
              <div className="text-xs text-gray-500 mt-2">
                Đang có: {getUnitInfo(fromUnitId)._count.equipments} thiết bị, {getUnitInfo(fromUnitId)._count.users} người dùng.
              </div>
            )}
          </div>

          <div className="col-span-1 flex justify-center text-blue-500">
            <ArrowRightLeft className="w-8 h-8" />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">SANG (Đích)</label>
            <select 
              className="w-full border p-2.5 rounded-md focus:ring-2 outline-none"
              value={toUnitId}
              onChange={e => setToUnitId(e.target.value)}
              required
            >
              <option value="">-- Chọn đơn vị đích --</option>
              {units.map(u => <option key={u.id} value={u.id} disabled={u.id === fromUnitId}>{u.name}</option>)}
            </select>
          </div>
        </div>

        {/* Chọn loại dữ liệu */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">CHỌN LOẠI DỮ LIỆU CẦN CHUYỂN</label>
            <button 
              type="button" 
              onClick={handleSelectAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {dataTypes.length === DATA_TYPES.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DATA_TYPES.map(type => (
              <label 
                key={type.id} 
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${dataTypes.includes(type.id) ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
              >
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded"
                  checked={dataTypes.includes(type.id)}
                  onChange={() => handleToggleType(type.id)}
                />
                <span className="font-medium text-gray-800">{type.icon} {type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Kết quả / Error */}
        {result && (
          <div className={`p-4 rounded-md border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {result.error ? (
              <div className="flex gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{result.error}</span>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 text-green-700 font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Chuyển đổi dữ liệu thành công!</span>
                </div>
                <ul className="list-disc pl-8 text-green-800 text-sm">
                  {Object.entries(result.results || {}).map(([key, val]) => (
                    <li key={key}>Đã chuyển <strong>{val}</strong> {key.toLowerCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading || !fromUnitId || !toUnitId || dataTypes.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Đang xử lý..." : "Thực hiện Chuyển Dữ Liệu"}
          </button>
        </div>

      </form>
    </div>
  )
}
