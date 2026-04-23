"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState(searchParams.get("name") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [equipment, setEquipment] = useState(searchParams.get("equipment") || "")

  // Sync state with URL params
  useEffect(() => {
    setName(searchParams.get("name") || "")
    setStatus(searchParams.get("status") || "")
    setEquipment(searchParams.get("equipment") || "")
  }, [searchParams])

  // Auto filter when typing/selecting
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams()
      if (name) params.set("name", name)
      if (status) params.set("status", status)
      if (equipment) params.set("equipment", equipment)
      router.push(`/dashboard/requests?${params.toString()}`)
    }, 400) // 400ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [name, status, equipment, router])

  const handleClear = () => {
    setName("")
    setStatus("")
    setEquipment("")
    router.push(`/dashboard/requests`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Người mượn</label>
        <div className="relative">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên hoặc email..."
            className="w-full border-gray-300 rounded-md text-sm py-2 pl-3 pr-8 border focus:ring-blue-500 focus:border-blue-500"
          />
          {name && (
            <button onClick={() => setName("")} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Thiết bị</label>
        <div className="relative">
          <input 
            type="text" 
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="Tên thiết bị..."
            className="w-full border-gray-300 rounded-md text-sm py-2 pl-3 pr-8 border focus:ring-blue-500 focus:border-blue-500"
          />
          {equipment && (
            <button onClick={() => setEquipment("")} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="w-[180px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đang mượn</option>
          <option value="RETURN_REQUESTED">Chờ xác nhận trả</option>
          <option value="RETURNED">Đã trả</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>
    </div>
  )
}
