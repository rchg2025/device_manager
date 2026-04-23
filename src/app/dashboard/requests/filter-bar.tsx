"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState(searchParams.get("name") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [equipment, setEquipment] = useState(searchParams.get("equipment") || "")

  useEffect(() => {
    setName(searchParams.get("name") || "")
    setStatus(searchParams.get("status") || "")
    setEquipment(searchParams.get("equipment") || "")
  }, [searchParams])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (name) params.set("name", name)
    if (status) params.set("status", status)
    if (equipment) params.set("equipment", equipment)
    router.push(`/dashboard/requests?${params.toString()}`)
  }

  const handleClear = () => {
    setName("")
    setStatus("")
    setEquipment("")
    router.push(`/dashboard/requests`)
  }

  return (
    <form onSubmit={handleFilter} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Người mượn</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên hoặc email..."
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Thiết bị</label>
        <input 
          type="text" 
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Tên thiết bị..."
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đang mượn</option>
          <option value="RETURNED">Đã trả</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
          <Filter className="w-4 h-4" /> Lọc
        </button>
        {(name || status || equipment) && (
          <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-1">
            <X className="w-4 h-4" /> Bỏ lọc
          </button>
        )}
      </div>
    </form>
  )
}
