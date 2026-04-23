"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, Calendar } from "lucide-react"
import { useState, useEffect } from "react"

export default function FilterBar({ role }: { role: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState(searchParams.get("name") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [equipment, setEquipment] = useState(searchParams.get("equipment") || "")
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "")
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "")

  // Sync state with URL params
  useEffect(() => {
    setName(searchParams.get("name") || "")
    setStatus(searchParams.get("status") || "")
    setEquipment(searchParams.get("equipment") || "")
    setFromDate(searchParams.get("fromDate") || "")
    setToDate(searchParams.get("toDate") || "")
  }, [searchParams])

  // Auto filter when typing/selecting
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams()
      // Preserve the filter action_required if it exists
      const filter = searchParams.get("filter")
      if (filter) params.set("filter", filter)
      
      if (name) params.set("name", name)
      if (status) params.set("status", status)
      if (equipment) params.set("equipment", equipment)
      if (fromDate) params.set("fromDate", fromDate)
      if (toDate) params.set("toDate", toDate)
      
      router.replace(`/dashboard/requests?${params.toString()}`, { scroll: false })
    }, 150) // 150ms debounce for near real-time feel

    return () => clearTimeout(delayDebounceFn)
  }, [name, status, equipment, fromDate, toDate, router, searchParams])

  const handleClear = () => {
    setName("")
    setStatus("")
    setEquipment("")
    setFromDate("")
    setToDate("")
    router.replace(`/dashboard/requests`, { scroll: false })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
      {role !== "MEMBER" && (
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
      )}
      
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

      <div className="w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
        <input 
          type="date" 
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
        <input 
          type="date" 
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="w-[160px]">
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

      {(name || status || equipment || fromDate || toDate) && (
        <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium flex items-center gap-1 shrink-0 h-[38px]">
          <X className="w-4 h-4" /> Bỏ lọc
        </button>
      )}
    </div>
  )
}
